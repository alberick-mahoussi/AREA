import 'package:flutter/material.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Material(
      elevation: 1.0,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.2),
              spreadRadius: 1,
              blurRadius: 20,
              offset: Offset(0, 10),
            ),
          ],
        ),
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
      ),
    );
  }

  @override
  Size get preferredSize => Size.fromHeight(kToolbarHeight);
}
