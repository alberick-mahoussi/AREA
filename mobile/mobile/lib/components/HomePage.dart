import 'package:flutter/material.dart';
import 'package:tasktie/components/CustomAppBar.dart';
import 'package:tasktie/utils/extensions.dart';
import 'package:tasktie/values/app_routes.dart';

class HomePageChoice extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    var screenHeight = MediaQuery.of(context).size.height;
    return Scaffold(
      appBar: CustomAppBar(),
      body: Center (
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: <Widget>[
            SizedBox(height: screenHeight / 4),
            const Text(
              "Welcome to AREA",
              style: TextStyle(fontSize: 22),
              textAlign: TextAlign.center,
            ),
            const Spacer(),
            FractionallySizedBox(
              widthFactor: 0.6,
              child: ElevatedButton(
                onPressed: () => AppRoutes.loginScreen.pushName(),
                child: const Text('Login'),
              ),
            ),
            const SizedBox(height: 45),
            FractionallySizedBox(
              widthFactor: 0.6,
              child: ElevatedButton(
                onPressed: () => AppRoutes.registerScreen.pushName(),
                child: const Text('Register'),
              ),
            ),
            const Padding(
              padding: EdgeInsets.only(bottom: 90),
            ),
          ],
        ),
      ),
    );
  }
}
