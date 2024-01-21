import 'package:flutter/material.dart';
import 'package:tasktie/values/app_routes.dart';
import 'package:provider/provider.dart';
import 'package:tasktie/utils/extensions.dart';
import '../main.dart';
import 'create_area_page.dart';

class LoadingPage extends StatefulWidget {
  @override
  _LoadingPageState createState() => _LoadingPageState();
}

class _LoadingPageState extends State<LoadingPage> {
  @override
  void initState() {
    super.initState();
    loadYourData().then((value) {
      Navigator.of(context).pushReplacementNamed(AppRoutes.createArea);
    });
  }

  Future<void> loadYourData() async {
    try {
      await Provider.of<ServicesDataJson>(context, listen: false).loadServicesAPI();
      await Provider.of<ServicesDataJson>(context, listen: false).userInformation(context);
    } catch (e) {
      print('Erreur lors du chargement des données: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: CircularProgressIndicator(),
      ),
    );
  }
}
