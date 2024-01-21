import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'create_area_page.dart';
import 'package:tasktie/components/CustomAppBar.dart';
import 'custom_bottom_navigation_bar.dart';

class ServicesToHidePage extends StatefulWidget {
  @override
  _ServicesToHidePageState createState() => _ServicesToHidePageState();
}

class _ServicesToHidePageState extends State<ServicesToHidePage> {
  String searchQuery = '';
  Map<String, bool> localServicesState = {};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final servicesDataJson = Provider.of<ServicesDataJson>(context, listen: false);
      await Future.wait([
        servicesDataJson.fetchServicesToHide(context),
      ]);
      initializeLocalState(servicesDataJson);
    });
  }

  void initializeLocalState(ServicesDataJson servicesData) {
    localServicesState = Map.fromIterable(
      servicesData.services,
      key: (service) => service['name'],
      value: (service) => !servicesData.servicesToHide.contains(service['name']),
    );
  }

  void saveHiddenServices() {
    List<String> hiddenServices = localServicesState.entries
      .where((entry) => !entry.value)
      .map((entry) => entry.key)
      .toList();
    Provider.of<ServicesDataJson>(context, listen: false).updateHideServices(context, hiddenServices);
  }

  @override
  Widget build(BuildContext context) {
    final servicesData = Provider.of<ServicesDataJson>(context);
    final filteredServices = servicesData.services
      .where((service) => service['name'].toLowerCase().contains(searchQuery.toLowerCase()))
      .toList();

    return Scaffold(
      appBar: CustomAreaAppBar(),
      body: Column(
        children: [
          const SizedBox(height: 40),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 30),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: TextField(
                onChanged: (value) => setState(() => searchQuery = value),
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
          ElevatedButton(
            onPressed: () => saveHiddenServices(),
            child: const Text('Save'),
          ),
          const SizedBox(height: 20),
          Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: ListView.separated(
              itemCount: filteredServices.length,
              separatorBuilder: (context, index) => SizedBox(height: 10),
              itemBuilder: (context, index) {
                final service = filteredServices[index];
                // bool isHidden = servicesToHide.contains(service['name']);
                return Card(
                  margin: EdgeInsets.all(3),
                  child: ListTile(
                    leading: Image.network(
                      service['picture'],
                      width: 40,
                      height: 40,
                      errorBuilder: (context, error, stackTrace) => Icon(Icons.error),
                    ),
                    title: Text(service['name']),
                    trailing: Switch(
                      value: localServicesState[service['name']] ?? false,
                      onChanged: (bool value) {
                        setState(() => localServicesState[service['name']] = value);
                      },
                      activeTrackColor: Colors.black,
                    ),
                  ),
                );
              },
            ),
          ),
        ),
      ],
    ),
    bottomNavigationBar: CustomBottomNavigationBar(selectedIndex: 2),
    );
  }
}
