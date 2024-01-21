import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:provider/provider.dart';
import 'package:tasktie/components/CustomAppBar.dart';
import 'package:tasktie/values/app_routes.dart';
import 'package:tasktie/main.dart';

import 'app_text_form_field.dart';
import '../utils/extensions.dart';
import '../values/app_colors.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'oath_services.dart';

import 'package:http/http.dart' as http;
import 'dart:async';
import 'dart:convert';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
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

class _LoginPageState extends State<LoginPage> with RouteAware {
  final _formKey = GlobalKey<FormState>();
  TextEditingController emailController = TextEditingController();
  TextEditingController passwordController = TextEditingController();

  bool isObscure = true;

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
      body: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 50),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    AppTextFormField(
                      labelText: 'Email',
                      keyboardType: TextInputType.emailAddress,
                      textInputAction: TextInputAction.next,
                      onChanged: (value) {
                        _formKey.currentState?.validate();
                      },
                      controller: emailController,
                    ),
                    AppTextFormField(
                      labelText: 'Password',
                      keyboardType: TextInputType.visiblePassword,
                      textInputAction: TextInputAction.done,
                      onChanged: (value) {
                        _formKey.currentState?.validate();
                      },
                      controller: passwordController,
                      obscureText: isObscure,
                      suffixIcon: Padding(
                        padding: const EdgeInsets.only(right: 15),
                        child: IconButton(
                          onPressed: () {
                            setState(() {
                              isObscure = !isObscure;
                            });
                          },
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
                    TextButton(
                      onPressed: () {
                        print("Forgot password!");
                      },
                      style: Theme.of(context).textButtonTheme.style,
                      child: Text(
                        'Forgot Password?',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppColors.links,
                              fontWeight: FontWeight.bold,
                              decoration: TextDecoration.underline,
                            ),
                      ),
                    ),
                    const SizedBox(
                      height: 15,
                    ),
                    FilledButton(
                      onPressed: () {
                        if (_formKey.currentState!.validate()) {
                          Future<void> submitForm() async {
                            try {
                              var apiUrl = dotenv.env['API_URL'] ?? "callback_url";
                              var signInEndpoint = '/auth/signin';
                              var userMeEndpoint = '/users/me';
                              var response = await http.post(
                                Uri.parse(combineUrl(apiUrl, signInEndpoint)),
                                body: {
                                  'email': emailController.text,
                                  'password': passwordController.text,
                                },
                              );
                              if (response.statusCode == 201) {
                                var responseBody = json.decode(response.body);
                                var token = responseBody['access_token'];
                                var dataResponse = await http.get(
                                  Uri.parse(combineUrl(apiUrl, userMeEndpoint)),
                                  headers: {
                                    'Authorization': 'Bearer $token',
                                  },
                                );
                                if (dataResponse.statusCode == 200) {
                                  Provider.of<AuthModel>(context, listen: false).login(token);
                                  AppRoutes.loadingScreen.pushReplacementName();
                                } else {
                                  print('Error signing in: ${dataResponse.statusCode}');
                                  showErrorPopup(context, "Impossible de se connecter");
                                }
                              } else {
                                print('Error signing in first: ${response.statusCode}');
                              }
                            } catch (error) {
                              print('Error: $error');
                            }
                          };
                          submitForm();
                          emailController.clear();
                          passwordController.clear();
                        }
                      },
                      style: FilledButton.styleFrom(
                        side: BorderSide(color: AppColors.white, width: 1),
                      ),
                      child: const Text('Login'),
                    ),

                    const SizedBox(
                      height: 30,
                    ),
                    Row(
                      children: [
                        Expanded(
                          child: Divider(
                            color: Colors.grey.shade200,
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 20,
                          ),
                          child: Text(
                            'Or login with',
                            style: Theme.of(context)
                                .textTheme
                                .bodySmall
                                ?.copyWith(color: Colors.black),
                          ),
                        ),
                        Expanded(
                          child: Divider(
                            color: Colors.grey.shade200,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(
                      height: 30,
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
                              'assets/img/google.svg', // Chemin de votre icône Google SVG
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
                padding:
                    const EdgeInsets.symmetric(vertical: 10, horizontal: 25),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    TextButton(
                      onPressed: () {
                        if (Navigator.of(context).canPop() && RouteHistory.lastRoute == AppRoutes.registerScreen) {
                          Navigator.pop(context);
                        } else {
                          RouteHistory.pushRoute(ModalRoute.of(context)?.settings.name);
                          Navigator.pushNamed(context, AppRoutes.registerScreen);
                        }
                      },
                      style: Theme.of(context).textButtonTheme.style,
                      child: Text(
                        "Don't have an account? Register",
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
