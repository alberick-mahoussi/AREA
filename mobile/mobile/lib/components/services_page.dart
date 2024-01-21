import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'create_area_page.dart';
import 'action_reaction_page.dart';
import 'oath_services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import '../main.dart';
import 'dart:convert';


class ChooseServicePage extends StatefulWidget {
  final bool isReaction;

  ChooseServicePage({Key? key, this.isReaction = false}) : super(key: key);

  @override
  _ChooseServicePageState createState() => _ChooseServicePageState(isReaction: isReaction);
}

class ServiceAuthConfig {
  final OAuthServiceConfig config;
  final String sign;

  ServiceAuthConfig({
    required this.config,
    required this.sign,
  });
}

class _ChooseServicePageState extends State<ChooseServicePage> {
  List filteredServices = [];
  final bool isReaction;

  _ChooseServicePageState({required this.isReaction});

  Map<String, ServiceAuthConfig> serviceConfigs = {
    'Github': ServiceAuthConfig(
      config: githubConfig,
      sign: '/github/SignupGithub',
    ),
    'Notion': ServiceAuthConfig(
      config: notionConfig,
      sign: '/notion/SignupNotion',
    ),
    'Gitlab': ServiceAuthConfig(
      config: gitlabConfig,
      sign: '/gitlab/SignupGitlab',
    ),
    'Google': ServiceAuthConfig(
      config: googleConfig,
      sign: '/google/RegisterGoogle',
    ),
    'Gmail': ServiceAuthConfig(
      config: googleConfig,
      sign: '/google/RegisterGoogle',
    ),
    'Google Calendar': ServiceAuthConfig(
      config: googleConfig,
      sign: '/google/RegisterGoogle',
    ),
    'Outlook': ServiceAuthConfig(
      config: microsoftConfig,
      sign: '/microsoft/RegisterOutlookMobile',
    ),
    'Discord': ServiceAuthConfig(
      config: discordConfig,
      sign: '/discord/SignupDiscord',
    ),
    'Spotify': ServiceAuthConfig(
      config: spotifyConfig,
      sign: '/spotify/SignupSpotify',
    ),
  };

  void navigateToService(BuildContext context, bool authentification, int serviceIndex, String serviceName) async {
    if (authentification) {
        try {
          var url = '${dotenv.env['API_URL']}/users/AuthenticatorChecker';
          var token = await Provider.of<AuthModel>(context, listen: false).getToken();
          var response = await http.post(
            Uri.parse(url),
            headers: {
              'Authorization': 'Bearer $token',
              'Content-Type': 'application/json',
            },
            body: jsonEncode({
              'name': serviceName,
            }),
          );
          if (response.statusCode == 201) {
            if (jsonDecode(response.body)['authentification'] == true) {
              Navigator.push(context, MaterialPageRoute(builder: (context) => ServiceActionReactionsPage(serviceIndex: serviceIndex, isReaction: isReaction,)));
            } else {
              if (serviceConfigs.containsKey(serviceName)) {
              var serviceConfig = serviceConfigs[serviceName]!;
              String tokenService = await getOAuthToken(context, serviceConfig.config);
              print(tokenService);
              try {
                var url = '${dotenv.env['API_URL']}${serviceConfig.sign}';
                var response = await http.post(
                  Uri.parse(url),
                  headers: {
                    'Authorization': 'Bearer $token',
                    'Content-Type': 'application/json',
                  },
                  body: jsonEncode({
                    'Token': tokenService,
                  }),
                );
                if (response.statusCode == 201) {
                  Navigator.push(context, MaterialPageRoute(builder: (context) => ServiceActionReactionsPage(serviceIndex: serviceIndex, isReaction: isReaction,)));
                } else {
                  print('Error token not send here : ${response.statusCode}');
                }
              } catch (e) {
                print('Error token not send: $e');
              }
            } else {
              print('Service configuration not found for $serviceName');
            }
          }
          }
        } catch (e) {
          print('Error token not send: $e');
        }
    } else {
      Navigator.push(context, MaterialPageRoute(builder: (context) => ServiceActionReactionsPage(serviceIndex: serviceIndex, isReaction: isReaction,)));
    }
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final servicesDataJson = Provider.of<ServicesDataJson>(context, listen: false);
      await Future.wait([
        servicesDataJson.fetchServicesToHide(context),
        servicesDataJson.loadServicesAPI(),
      ]);
      servicesDataJson.filterServices('', isReaction);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Choice of services', style: TextStyle(fontSize: 25)),
      ),
      body: Column(
        children: [
          const SizedBox(height: 40),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 30),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: TextField(
                onChanged: (value) {
                  Provider.of<ServicesDataJson>(context, listen: false).filterServices(value, isReaction);
                },
                decoration: const InputDecoration(
                  hintText: "Service search",
                  prefixIcon: Icon(Icons.search),
                  border: InputBorder.none,
                  enabledBorder: OutlineInputBorder(borderSide: BorderSide(width: 3, color: Colors.black,)),
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),
          Expanded(
            child: Consumer<ServicesDataJson>(
              builder: (context, servicesData, child) {
                // filteredServices = servicesData.services;
                return GridView.builder(
              padding: const EdgeInsets.all(20.0),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 10,
                mainAxisSpacing: 20,
                childAspectRatio: MediaQuery.of(context).size.width /
                    (MediaQuery.of(context).size.height / 2.5),
              ),
                itemCount: servicesData.filteredServices.length,
                itemBuilder: (BuildContext context, int index) {
                final service = servicesData.filteredServices[index];
                final serviceName = service['name'] ?? "Erreur: Pas de Nom";
                final servicePicture = service['picture'];
                final serviceIndex = service['serviceId'];
                final serviceAuth = service['authentification'];
                return Card(
                  shape: RoundedRectangleBorder(
                    borderRadius:
                        BorderRadius.circular(15),
                  ),
                  child: InkWell(
                    onTap: () {
                      navigateToService(context, serviceAuth, serviceIndex, serviceName);
                    },
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        if (servicePicture != null)
                          Padding(
                            padding: const EdgeInsets.all(
                                8.0),
                            child: Image.network(
                              servicePicture,
                              fit: BoxFit.contain,
                              height: 70,
                              errorBuilder: (context, error, stackTrace) =>
                                  const Icon(
                                Icons.error,
                                size: 30,
                              ),
                            ),
                          ),
                        Text(
                          serviceName,
                          style: const TextStyle(fontSize: 16),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                );
              },
            );

              },
            ),
          ),
        ],
      ),
    );
  }
}
