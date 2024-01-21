import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:tasktie/values/app_routes.dart';
import '../main.dart';

class CustomAreaAppBar extends StatelessWidget implements PreferredSizeWidget {
  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: Row(

        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          GestureDetector(
            onTap: () {
              print("Home");
            },
            child: Padding(
              padding: const EdgeInsets.only(right: 20),
              child: Image.asset(
                'assets/img/area_logo.png',
                fit: BoxFit.contain,
                height: 20,
              ),
            ),
          ),
        ],
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.exit_to_app),
          onPressed: () {
            // Accédez à votre modèle d'authentification et déclenchez la déconnexion
            Provider.of<AuthModel>(context, listen: false).logout();
            // Naviguez vers l'écran de connexion et supprimez toutes les routes derrière
            Navigator.of(context).pushNamedAndRemoveUntil(
              AppRoutes.homeScreen,
              (Route<dynamic> route) => false,
            );
          },
        ),
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Material(
      elevation: 1.0,
        child: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          title: Row(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              GestureDetector(
                onTap: () {
                  print("Home");
                },
                child: Padding(
                  padding: const EdgeInsets.only(right: 20),
                  child: Image.asset(
                    'assets/img/area_logo.png',
                    fit: BoxFit.contain,
                    height: 20,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      // ),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
