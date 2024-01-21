import 'package:flutter/material.dart';
import 'package:tasktie/components/CustomAppBar.dart';
import 'services_page.dart';
import 'package:provider/provider.dart';
import '../main.dart';
import 'package:http/http.dart' as http;
import 'custom_bottom_navigation_bar.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'history_page.dart';
import 'dart:convert';

class CreateAreaPage extends StatefulWidget {
  CreateAreaPage({Key? key}) : super(key: key);

  @override
  _CreateAreaPageState createState() => _CreateAreaPageState();
}

class ServicesDataJson extends ChangeNotifier {
  List _services = [];
  List get services => _services;
  Map<String, dynamic> _client = {};
  Map<String, dynamic> get client => _client;
  List _filteredServices = [];
  List get filteredServices => _filteredServices;

  List _servicesToHide = [];
  List get servicesToHide => _servicesToHide;

  List _history = ['Weather'];
  List get history => _history;


  void setServices(List services) {
    _services = services;
    _filteredServices = services;
    notifyListeners();
  }

  void setHistory(Map<String, dynamic> area) {
    if (area.isNotEmpty) {
      _history = area['areas'];
    } else {
      _history = [];
    }
    notifyListeners();
  }

  void setClient(Map<String, dynamic> client) {
    _client = client;
    notifyListeners();
  }

  void setServiceHide(List services) {
    _servicesToHide = services;
    notifyListeners();
  }

  Future<void> updateHideServices(BuildContext context, List<String> hiddenServices) async {
    try {
      var url = '${dotenv.env['API_URL']}/users/DiseableService';
      var token = await Provider.of<AuthModel>(context, listen: false).getToken();
      var response = await http.post(
        Uri.parse(url),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'ServiceDiseable': hiddenServices,
        }),
      );
      if (response.statusCode == 201) {
        fetchServicesToHide(context);
      } else {
        print('Erreur lors de la récupération des données updateHideServices ici : ${response.statusCode}');
      }
    } catch (e) {
      print('Erreur lors de la récupération des données updateHideServices: $e');
    }
  }

  Future<void> updatePassword(BuildContext context, String password) async {
    try {
      var url = '${dotenv.env['API_URL']}/users/UpdatePassword';
      var token = await Provider.of<AuthModel>(context, listen: false).getToken();
      var response = await http.post(
        Uri.parse(url),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'password': password,
        }),
      );
      if ((response.statusCode == 201)) {
        print("done");
      }
      if (!(response.statusCode == 201)) {
        print('Erreur lors de la récupération des données updateUsername ici : ${response.statusCode}');
      }
    } catch (e) {
      print('Erreur lors de la récupération des données updateUsername: $e');
    }
  }


  Future<void> updateUsername(BuildContext context, String username) async {
    try {
      var url = '${dotenv.env['API_URL']}/users/UpdateUserUsername';
      var token = await Provider.of<AuthModel>(context, listen: false).getToken();
      var response = await http.post(
        Uri.parse(url),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'username': username,
        }),
      );
      if (response.statusCode == 201) {
        await userInformation(context);
      } else {
        print('Erreur lors de la récupération des données updateUsername ici : ${response.statusCode}');
      }
    } catch (e) {
      print('Erreur lors de la récupération des données updateUsername: $e');
    }
  }

  Future<void> fetchServicesToHide(BuildContext context) async {
    try {
      var url = '${dotenv.env['API_URL']}/users/ListServiceDiseabled';
      var token = await Provider.of<AuthModel>(context, listen: false).getToken();
      var response = await http.get(
        Uri.parse(url),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );
      if (response.statusCode == 200) {
        setServiceHide(json.decode(response.body));
      } else {
        print('Erreur lors de la récupération des données hide ici : ${response.statusCode}');
      }
    } catch (e) {
      print('Erreur lors de la récupération des données hide: $e');
    }
  }

  Future<void> userInformation(BuildContext context) async {
    try {
      var url = '${dotenv.env['API_URL']}/users/me';
      var token = await Provider.of<AuthModel>(context, listen: false).getToken();
      var response = await http.get(
        Uri.parse(url),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );
      if (response.statusCode == 200) {
        var client = json.decode(response.body);
        setClient(client);
      } else {
        print('Erreur lors de la récupération des données info ici: ${response.statusCode}');
      }
    } catch (e) {
      print('Erreur lors de la récupération des données info: $e');
    }
  }

  Future<void> deleteArea(BuildContext context, int index) async {
    try {
      var url = '${dotenv.env['API_URL']}/users/DeleteArea';
      var token = await Provider.of<AuthModel>(context, listen: false).getToken();
      final response = await http.post(
        Uri.parse(url),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'areaId': index,
        }),
      );
      if (response.statusCode == 201) {
          userHistory(context);
      } else {
        print('Erreur lors de la récupération des données ici delete : ${response.statusCode}');
      }
    } catch (e) {
      print('Erreur lors de la récupération des données delete : $e');
    }
  }

  Future<void> userHistory(BuildContext context) async {
    try {
      var url = '${dotenv.env['API_URL']}/users/UserArea';
      var token = await Provider.of<AuthModel>(context, listen: false).getToken();
      var response = await http.get(
        Uri.parse(url),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );
      if (response.statusCode == 200) {
        var history = json.decode(response.body);
        setHistory(history);
      } else {
        print('Erreur lors de la récupération des données historique ici : ${response.statusCode}');
      }
    } catch (e) {
      print('Erreur lors de la récupération des données historique : $e');
    }
  }

  void filterServices(String query, bool isReactionMode) {
    _filteredServices = _services.where((service) {
      bool matchesQuery = service['name'].toString().toLowerCase().contains(query.toLowerCase());
      bool hasValidType = isReactionMode ? (service['reactions'] as List).isNotEmpty : (service['actions'] as List).isNotEmpty;
      bool isNotHidden = !servicesToHide.contains(service['name']);
      return matchesQuery && hasValidType && isNotHidden;
    }).toList();
    notifyListeners();
  }

  Future<void> loadServicesAPI() async {
    try {
      var url = '${dotenv.env['API_URL']}/about/json';
      var response = await http.get(Uri.parse(url));
      if (response.statusCode == 200) {
        final parsedJson = json.decode(response.body);
        if (parsedJson['server']['services'] is List) {
          setServices(parsedJson['server']['services']);
        } else {
          print('Les services ne sont pas dans le format attendu.');
        }
      } else {
        print('Erreur lors de la récupération des données API ici : ${response.statusCode}');
      }
    } catch (e) {
      print('Erreur lors de la récupération des données API : $e');
    }
  }
}

class ServiceData extends ChangeNotifier {
  String? _service1Name;
  int? _service1Id;
  int? _actionId;
  List<String>? _actionParams;
  String? _service2Name;
  int? _service2Id;
  int? _reactionId;
  List<String>? _reactionParams;

  String? get service1Name => _service1Name;
  int? get service1Id => _service1Id;
  int? get actionId => _actionId;
  List<String>? get actionParams => _actionParams;
  String? get service2Name => _service2Name;
  int? get service2Id => _service2Id;
  int? get reactionId => _reactionId;
  List<String>? get reactionParams => _reactionParams;

  bool get isService1Complete => _service1Name != null && _actionId != null && _actionParams != null;
  bool get isService2Complete => _service2Name != null && _reactionId != null && _reactionParams != null;
  
  void updateService1(String name, int id, int id2, List<String> params) {
    _service1Name = name;
    _service1Id = id;
    _actionId = id2;
    _actionParams = params;
    notifyListeners();
  }

  void updateService2(String name, int id, int id2, List<String> params) {
    _service2Name = name;
    _service2Id = id;
    _reactionId = id2;
    _reactionParams = params;
    notifyListeners();
  }
  void resetData() {
    _service1Name = null;
    _actionId = null;
    _actionParams = null;
    _service2Name = null;
    _reactionId = null;
    _reactionParams = null;
    _service1Id = null;
    _service2Id = null;
    notifyListeners();
  }
  void addToHistory() {
    if (isService1Complete && isService2Complete) {
      final newHistoryItem = {
        'service1Id': _service1Name,
        'actionName': _actionId,
        'actionParams': _actionParams,
        'service2Id': _service2Name,
        'reactionName': _reactionId,
        'reactionParams': _reactionParams,
        'enabled': true,
      };
      HistoryPage.historyItems.add(newHistoryItem);
    }
    notifyListeners();
  }
}
class _CreateAreaPageState extends State<CreateAreaPage> {

  @override
  Widget build(BuildContext context) {
    final serviceData = Provider.of<ServiceData>(context);
    final services = Provider.of<ServicesDataJson>(context, listen: false).services;
    final clientData = Provider.of<ServicesDataJson>(context).client;
    var username = '';
    if (clientData == null || clientData['user'] == null) {
      username = '';
    } else {
      username = clientData['user']['username'] ?? 'monsieur';
    }
    bool isFinishButtonEnabled = serviceData.isService1Complete && serviceData.isService2Complete;

    String? imageUrl1 = "";
    if (serviceData.service1Id != null && serviceData.service1Id! >= 0  && services.isNotEmpty) {
      imageUrl1 = services[serviceData.service1Id!]['picture'];
    }

    String? imageUrl2 = "";
    if (serviceData.service2Name != null && serviceData.service2Id! >= 0 && services.isNotEmpty) {
      imageUrl2 = services[serviceData.service2Id!]['picture'];
    }

    void finishButtonPressed() async {
    if (isFinishButtonEnabled) {
      try {
        final serviceData = await Provider.of<ServiceData>(context, listen: false);
        var token = await Provider.of<AuthModel>(context, listen: false).getToken();
        var apiUrl = dotenv.env['API_URL'] ?? "callback_url";
        var signInEndpoint = '/users/CreateArea';
        final url = Uri.parse(apiUrl+signInEndpoint);
        final response = await http.post(
          url,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
          body: jsonEncode({
            'ActionId': serviceData.actionId,
            'ActionName': serviceData.service1Name,
            'ActionParam': serviceData.actionParams,
            'ReactionId': serviceData.reactionId,
            'ReactionName': serviceData.service2Name,
            'ReactionParam': serviceData.reactionParams,
          }),
        );
        if (response.statusCode == 201) {
          print('Area created successfully.');
        } else {
          print('Failed to create area. Status code: ${response.statusCode}');
        }
      } catch (e) {
        print('Error occurred: $e');
      }
      serviceData.resetData();
    }
  }

    return Scaffold(
      appBar: CustomAreaAppBar(),
      body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'Welcome $username',
                style: const TextStyle(fontSize: 22)
              ),
              const SizedBox(height: 40),
              ServiceButton(
                serviceNumber: 1,
                imagePath: imageUrl1,
                onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => ChooseServicePage(),
                    ),
                  )
              ),
              const SizedBox(height: 20),
              const Icon(Icons.arrow_downward, size: 30,),
              const SizedBox(height: 20),
              ServiceButton(
                serviceNumber: 2,
                imagePath: imageUrl2,
                onPressed: serviceData.isService1Complete
                  ? () { Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => ChooseServicePage(isReaction: true,),
                        ),
                      );
                    }
                  : null,
              ),
              const SizedBox(height: 40),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SizedBox(
                    width: 150,
                    child: ElevatedButton(
                      onPressed: isFinishButtonEnabled ? () {
                        finishButtonPressed();
                      } : null,
                      child: const Text('Finish', style: TextStyle(fontSize: 12)),
                    ),
                  ),
                  const SizedBox(width: 20),
                  SizedBox(
                    width: 150,
                    child: ElevatedButton.icon(
                      onPressed: serviceData.isService1Complete != false ? () {
                        serviceData.resetData();
                      } : null,
                      icon: const Icon(Icons.delete, size: 16),
                      label: const Text('Reset', style: TextStyle(fontSize: 12)),
                      style: ElevatedButton.styleFrom(
                        primary: const Color.fromARGB(255, 228, 79, 69),
                        onSurface: Colors.red.withOpacity(0.5),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      bottomNavigationBar: const CustomBottomNavigationBar(selectedIndex: 0),
    );
  }
}
class ServiceButton extends StatelessWidget {
  final int serviceNumber;
  final String? imagePath;
  final VoidCallback? onPressed;

  ServiceButton({Key? key, required this.serviceNumber, this.imagePath, this.onPressed}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    bool shouldDisplayImage = imagePath?.isNotEmpty ?? false;

    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        maximumSize: const Size(300, 50),
        minimumSize: const Size(300, 50),
      ),
      child: shouldDisplayImage
          ? Image.network(
              imagePath!,
              fit: BoxFit.contain,
              height: 40,
              errorBuilder: (context, error, stackTrace) {
                return Center(
                  child: Text('Service $serviceNumber', style: const TextStyle(fontSize: 20)),
                );
              },
            )
          : Center(
              child: Text('Service $serviceNumber', style: const TextStyle(fontSize: 20)),
            ),
    );
  }
}
