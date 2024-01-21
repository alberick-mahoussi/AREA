import 'package:flutter/material.dart';
import 'package:tasktie/components/custom_app_bar.dart';
import 'package:flutter_svg/flutter_svg.dart';

import 'app_text_form_field.dart';
import '../utils/extensions.dart';
import '../values/app_colors.dart';
import '../values/app_constants.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  TextEditingController nameController = TextEditingController();
  TextEditingController emailController = TextEditingController();
  TextEditingController passwordController = TextEditingController();
  TextEditingController confirmPasswordController = TextEditingController();

  bool isObscure = true;
  bool isConfirmPasswordObscure = true;

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
                          onPressed: () {},
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
                          onPressed: () {},
                          style: Theme.of(context).outlinedButtonTheme.style,
                          child: SvgPicture.asset(
                            'assets/img/outlook.svg',
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
                      Navigator.pop(context);
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
