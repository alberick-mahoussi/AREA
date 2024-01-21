import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
// import 'package:flutter/services.dart';

import 'package:tasktie/components/HomePage.dart';

import 'values/app_theme.dart';
import 'components/LoginPage.dart';
import 'components/loading_page.dart';
import 'components/RegisterPage.dart';
import 'components/create_area_page.dart';
import 'components/profil_page.dart';
import 'components/history_page.dart';
import 'components/services_page.dart';
import 'components/services_to_hide.dart';
import 'components/action_reaction_page.dart';
import 'values/app_constants.dart';
import 'values/app_routes.dart';


Future main() async {
  await dotenv.load(fileName: ".env");
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (context) => AuthModel()),
        ChangeNotifierProvider(create: (context) => ServicesDataJson()),
        ChangeNotifierProvider(create: (context) => ServiceData()),
      ],
      child: const MyApp(),
    ),
  );
}
class AuthModel extends ChangeNotifier {
  final FlutterSecureStorage _storage = FlutterSecureStorage();
  String? _token;
  bool _isAuthenticated = false;

  String? get token => _token;
  bool get isAuthenticated => _isAuthenticated;

  Future<void> login(String token) async {
    _token = token;
    _isAuthenticated = true;
    await _storage.write(key: 'access_token', value: token);
    notifyListeners();
  }

  Future<void> logout() async {
    await _storage.delete(key: 'access_token');
    _token = null;
    _isAuthenticated = false;
    notifyListeners();
  }

  Future<String?> getToken() async {
    _token = await _storage.read(key: 'access_token');
    _isAuthenticated = _token != null;
    notifyListeners();
    return _token;
  }
}
class RouteHistory {
  static final List<String?> _routeStack = [];

  static void pushRoute(String? routeName) {
    _routeStack.add(routeName);
  }

  static String? popRoute() {
    if (_routeStack.isNotEmpty) {
      return _routeStack.removeLast();
    }
    return null;
  }

  static String? get lastRoute => _routeStack.isNotEmpty ? _routeStack.last : null;
}
class HomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthModel>(context);

    if (auth.isAuthenticated) {
      // Planifiez la navigation après que le cycle de construction est terminé
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.of(context).pushNamedAndRemoveUntil(
          AppRoutes.createArea, // La route vers laquelle vous naviguez
          (Route<dynamic> route) => false, // Condition pour enlever les routes précédentes
        );
      });
    } else {
      // Planifiez la navigation vers la page de choix
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.of(context).pushReplacementNamed(AppRoutes.homeScreenChoice);
      });
    }

    // Afficher un indicateur de progression pendant que la condition est évaluée
    return Scaffold(
      body: const Center(
        child: CircularProgressIndicator(),
      ),
    );
  }
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    Theme.of(context);
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'AREA',
      theme: AppTheme.themeData,
      initialRoute: AppRoutes.homeScreen,
      navigatorKey: AppConstants.navigationKey,
      routes: {
        AppRoutes.homeScreen: (context) => HomePage(),
        AppRoutes.loadingScreen: (context) => LoadingPage(),  
        AppRoutes.homeScreenChoice: (context) => HomePageChoice(),
        AppRoutes.loginScreen: (context) => const LoginPage(),
        AppRoutes.registerScreen: (context) => const RegisterPage(),
        AppRoutes.createArea: (context) => CreateAreaPage(),
        AppRoutes.historyPage: (context) => HistoryPage(),
        AppRoutes.profilPage: (context) => ProfilePage(),
        AppRoutes.services: (context) => ServicesToHidePage(),
        AppRoutes.selectService: (context) => ChooseServicePage(),
        AppRoutes.selectAction: (context) => ServiceActionReactionsPage(serviceIndex: 0),

      },
    );
  }
}