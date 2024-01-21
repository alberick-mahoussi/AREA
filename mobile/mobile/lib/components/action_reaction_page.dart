import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'create_area_page.dart';
import 'parameters_page.dart';

class ServiceActionReactionsPage extends StatelessWidget {
  final int serviceIndex;
  final bool isReaction; // Ajoutez ce paramètre

  ServiceActionReactionsPage({Key? key, required this.serviceIndex, this.isReaction = false}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final servicesData = Provider.of<ServicesDataJson>(context);
    final actions = servicesData.services[serviceIndex][isReaction ? 'reactions' : 'actions'] ?? [];
    return Scaffold(
      appBar: AppBar(
        title: Text(isReaction ? 'Service reactions' : 'Service actions', style: const TextStyle(fontSize: 22)),
      ),
      body: Padding(
        padding: const EdgeInsets.all(30.0),
        child: ListView.separated(
          itemCount: actions.length,
          itemBuilder: (context, index) {
            String actionName = actions[index]['name'].replaceAll('_', ' ');
            List<String> parameters = [];
            if (actions[index]["parameters"] is List) {
              parameters = (actions[index]["parameters"] as List).map((e) => e.toString()).toList();
            }
            return ElevatedButton(
              style: ElevatedButton.styleFrom(
                primary: Colors.black,
                onPrimary: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                padding: EdgeInsets.symmetric(vertical: 15),
              ),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => ParameterPage(
                      serviceName: servicesData.services[serviceIndex]['name'],
                      serviceId: serviceIndex,
                      actionOrReactionIndex: index,
                      isReaction: isReaction,
                      parameters: parameters,
                    ),
                  ),
                );
              },
              child: Text(
                actionName,
                style: TextStyle(fontSize: 18),
              ),
            );
          },
          separatorBuilder: (context, index) => const SizedBox(height: 30),
        ),
      ),
    );
  }
}

