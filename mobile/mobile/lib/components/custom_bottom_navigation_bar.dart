import 'package:flutter/material.dart';
import 'package:tasktie/utils/extensions.dart';
import 'package:tasktie/values/app_routes.dart';

class CustomBottomNavigationBar extends StatelessWidget {
  final int selectedIndex;

  const CustomBottomNavigationBar({required this.selectedIndex});

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      currentIndex: selectedIndex,
      type: BottomNavigationBarType.fixed,
      items: const [
        BottomNavigationBarItem(
          icon: Icon(Icons.home),
          label: 'Create',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.history),
          label: 'History',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.settings),
          label: 'Services',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.person),
          label: 'Profile',
        ),
      ],
      onTap: (index) {
        switch (index) {
          case 0:
            AppRoutes.createArea.pushReplacementName();
            break;
          case 1:
            AppRoutes.historyPage.pushReplacementName();
            break;
          case 2:
            AppRoutes.services.pushReplacementName();
            break;
          case 3:
            AppRoutes.profilPage.pushReplacementName();
            break;
        }
      },
    );
  }
}
