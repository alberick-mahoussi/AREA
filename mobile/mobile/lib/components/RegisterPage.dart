import 'package:flutter/material.dart';
import 'package:tasktie/components/CustomAppBar.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:provider/provider.dart';
import 'package:tasktie/main.dart';

import 'app_text_form_field.dart';
import '../utils/extensions.dart';
import '../values/app_colors.dart';
import '../values/app_routes.dart';
import '../values/app_constants.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'oath_services.dart';

import 'package:http/http.dart' as http;
import 'dart:async';
import 'dart:convert';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

String combineUrl(String baseUrl, String endpoint) {
  if (!baseUrl.endsWith('/')) {
    baseUrl += '/';
  }
  if (endpoint.startsWith('/')) {
    endpoint = endpoint.substring(1);
  }
  return baseUrl + endpoint;
}

class _RegisterPageState extends State<RegisterPage> with RouteAware {
  final _formKey = GlobalKey<FormState>();
  TextEditingController nameController = TextEditingController();
  TextEditingController emailController = TextEditingController();
  TextEditingController passwordController = TextEditingController();
  TextEditingController confirmPasswordController = TextEditingController();

  bool isObscure = true;
  bool isConfirmPasswordObscure = true;

    void oauthGoogle(BuildContext context) async {
    String tokenService = await getOAuthToken(context, googleConfig);
    try {
      var url = '${dotenv.env['API_URL']}/google/SigninGoogle';
      var response = await http.post(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'Token': tokenService,
        }),
      );
      if (response.statusCode == 201) {
        var token = jsonDecode(response.body)['access_token'];
        Provider.of<AuthModel>(context, listen: false).login(token);
        AppRoutes.loadingScreen.pushReplacementName();
      } else {
        print('Error token not send here : ${response.statusCode}');
      }
    } catch (e) {
      print('Error token not send: $e');
    }
  }

  void oauthMicrosoft(BuildContext context) async {
    String tokenService = await getOAuthToken(context, microsoftConfig);
    try {
      var url = '${dotenv.env['API_URL']}/microsoft/SigninMicrosoftMobile';
      var response = await http.post(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'Token': tokenService,
        }),
      );
      if (response.statusCode == 201) {
        var token = jsonDecode(response.body)['access_token'];
        Provider.of<AuthModel>(context, listen: false).login(token);
        AppRoutes.loadingScreen.pushReplacementName();
      } else {
        print('Error token not send here : ${response.statusCode}');
      }
    } catch (e) {
      print('Error token not send: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = context.mediaQuerySize;
    return Scaffold(
      appBar: CustomAppBar(),
      body: Form(
        key: _formKey,
        child: ListView(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: 20,
                vertical: 50,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  AppTextFormField(
                    labelText: 'Name',
                    autofocus: true,
                    keyboardType: TextInputType.name,
                    textInputAction: TextInputAction.next,
                    onChanged: (value) => _formKey.currentState?.validate(),
                    validator: (value) {
                      return value!.isEmpty
                          ? null
                          : value.length < 4
                              ? 'Invalid Name'
                              : null;
                    },
                    controller: nameController,
                  ),
                  AppTextFormField(
                    labelText: 'Email',
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.next,
                    onChanged: (_) => _formKey.currentState?.validate(),
                    validator: (value) {
                      return value!.isEmpty
                          ? null
                          : AppConstants.emailRegex.hasMatch(value)
                              ? null
                              : 'Invalid Email Address';
                    },
                    controller: emailController,
                  ),
                  AppTextFormField(
                    labelText: 'Password',
                    keyboardType: TextInputType.visiblePassword,
                    textInputAction: TextInputAction.next,
                    onChanged: (_) => _formKey.currentState?.validate(),
                    validator: (value) {
                      return value!.isEmpty
                          ? null
                          : AppConstants.passwordRegex.hasMatch(value)
                              ? null
                              : 'Invalid Password';
                    },
                    controller: passwordController,
                    obscureText: isObscure,
                    suffixIcon: Padding(
                      padding: const EdgeInsets.only(right: 15),
                      child: Focus(
                        descendantsAreFocusable: false,
                        child: IconButton(
                          onPressed: () => setState(() {
                            isObscure = !isObscure;
                          }),
                          style: ButtonStyle(
                            minimumSize: MaterialStateProperty.all(
                              const Size(48, 48),
                            ),
                          ),
                          icon: Icon(
                            isObscure
                                ? Icons.visibility_off_outlined
                                : Icons.visibility_outlined,
                            color: Colors.black,
                          ),
                        ),
                      ),
                    ),
                  ),
                  AppTextFormField(
                    labelText: 'Confirm Password',
                    keyboardType: TextInputType.visiblePassword,
                    textInputAction: TextInputAction.done,
                    onChanged: (value) {
                      _formKey.currentState?.validate();
                    },
                    validator: (value) {
                      return value!.isEmpty
                          ? null
                          : AppConstants.passwordRegex.hasMatch(value)
                              ? passwordController.text ==
                                      confirmPasswordController.text
                                  ? null
                                  : 'Password not matched!'
                              : 'Invalid Password!';
                    },
                    controller: confirmPasswordController,
                    obscureText: isConfirmPasswordObscure,
                    suffixIcon: Padding(
                      padding: const EdgeInsets.only(right: 15),
                      child: Focus(
                        descendantsAreFocusable: false,
                        child: IconButton(
                          onPressed: () {
                            setState(() {
                              isConfirmPasswordObscure =
                                  !isConfirmPasswordObscure;
                            });
                          },
                          style: ButtonStyle(
                            minimumSize: MaterialStateProperty.all(
                              const Size(48, 48),
                            ),
                          ),
                          icon: Icon(
                            isConfirmPasswordObscure
                                ? Icons.visibility_off_outlined
                                : Icons.visibility_outlined,
                            color: Colors.black,
                          ),
                        ),
                      ),
                    ),
                  ),
                  FilledButton(
                    onPressed: _formKey.currentState?.validate() ?? false
                        ? () {
                            if (_formKey.currentState!.validate()) {
                            Future<void> submitForm() async {
                              try {
                              var apiUrl = dotenv.env['API_URL'] ?? "callback_url";
                              var signInEndpoint = '/auth/signup';
                              var userMeEndpoint = '/users/me';
                              var response = await http.post(
                                Uri.parse(combineUrl(apiUrl, signInEndpoint)),
                                  body: {
                                    'username': nameController.text,
                                    'email': emailController.text,
                                    'password': passwordController.text,
                                  },
                                );
                                if (response.statusCode == 201) {
                                  var responseBody = json.decode(response.body);
                                  var token = responseBody["access_token"];
                                  var dataResponse = await http.get(
                                    Uri.parse(combineUrl(apiUrl, userMeEndpoint)),
                                    headers: {
                                      "Authorization": 'Bearer $token',
                                    },
                                  );
                                  if (dataResponse.statusCode == 200) {
                                    Provider.of<AuthModel>(context, listen: false).login(token);
                                    AppRoutes.loadingScreen.pushReplacementName();
                                  } else {
                                    print('Error signing up with token: ${dataResponse.statusCode}');
                                    showErrorPopup(context, "Impossible de s'inscrire");
                                  }
                                } else {
                                  print('Error signing up: ${response.statusCode}');
                                }
                              } catch (error) {
                                print('Error: $error');
                              }
                            };
                            submitForm();
                            ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Registration Complete!'),
                                ),
                              );
                              nameController.clear();
                              emailController.clear();
                              passwordController.clear();
                              confirmPasswordController.clear();
                          }
                        }
                        : null,
                    style: FilledButton.styleFrom(
                        side: BorderSide(color: AppColors.white, width: 1),
                    ),
                    child: const Text('Register'),
                  ),
                  const SizedBox(
                      height: 20,
                  ),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () {
                            oauthGoogle(context);
                          },
                          style: Theme.of(context).outlinedButtonTheme.style,
                          child: SvgPicture.asset(
                            'assets/img/google.svg',
                            width: 24,
                          ),
                        ),
                      ),
                      const SizedBox(
                        width: 20,
                      ),
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () {
                            oauthMicrosoft(context);
                          },
                          style: Theme.of(context).outlinedButtonTheme.style,
                          child: SvgPicture.asset(
                            'assets/img/outlook.svg', // Chemin de votre icône Outlook SVG
                            width: 30,
                          ),
                        ),
                      ),
                    ],
                  )
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 1, horizontal: 25),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  TextButton(
                    onPressed: () {
                      if (Navigator.of(context).canPop() && RouteHistory.lastRoute == AppRoutes.loginScreen) {
                        Navigator.pop(context);
                      } else {
                        RouteHistory.pushRoute(ModalRoute.of(context)?.settings.name);
                        Navigator.pushNamed(context, AppRoutes.loginScreen);
                      }
                    },
                    style: Theme.of(context).textButtonTheme.style,
                    child: Text(
                      'I have an account? Login',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppColors.links,
                            fontWeight: FontWeight.bold,
                            decoration: TextDecoration.underline,
                          ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

void showErrorPopup(BuildContext context, String message) {
  showDialog(
    context: context,
    builder: (BuildContext context) {
      return AlertDialog(
        title: Text("Erreur"),
        content: Text(message),
        actions: <Widget>[
          TextButton(
            child: Text("Fermer"),
            onPressed: () {
              Navigator.of(context).pop();
            },
          ),
        ],
      );
    },
  );
}
