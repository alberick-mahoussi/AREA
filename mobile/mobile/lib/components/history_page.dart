import 'package:flutter/material.dart';
import 'package:tasktie/components/CustomAppBar.dart';
import 'package:tasktie/components/custom_bottom_navigation_bar.dart';
import 'package:provider/provider.dart';
import 'create_area_page.dart';

class HistoryPage extends StatefulWidget {
  static List<Map<String, dynamic>> historyItems = [
  ];

  @override
  _HistoryPageState createState() => _HistoryPageState();
}

class _HistoryPageState extends State<HistoryPage> {

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final servicesDataJson = Provider.of<ServicesDataJson>(context, listen: false);
      await Future.wait([
        servicesDataJson.userHistory(context),
      ]);
    });
  }

  void showDetailsDialog(Map<String, dynamic> item, int index) {
    final services = Provider.of<ServicesDataJson>(context, listen: false).services;
    final servicesDataJson = Provider.of<ServicesDataJson>(context, listen: false);
    Map<String, bool> onOffMap = {
      "ON": true,
      "OFF": false,
    };
    bool localEnabled = onOffMap[item['state']] ?? true;
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Details'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("Action:", style: TextStyle(fontSize: 18),),
              Text("  ${services[getServiceIndexByName(services, item["Action_Service"])]['actions'][item['Action_id']]['name'].replaceAll('_', ' ')}"),
              Text("  Parameters ${item['ActionParam']}"),
              const Text("Reaction:", style: TextStyle(fontSize: 18),),
              Text("  ${services[getServiceIndexByName(services, item["Reaction_Service"])]['reactions'][item['ReactionId']]['name'].replaceAll('_', ' ')}"),
              Text("  Parameters ${item['ReactionParam']}"),
            ],
          ),
          actions: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton(
                  icon: Icon(Icons.delete),
                  onPressed: () {
                    setState(() {
                      servicesDataJson.deleteArea(context, item['Id']);
                      Navigator.of(context).pop();
                      setState(() {});
                    });
                  },
                ),
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Close'),
                ),
              ],
            ),
          ],
        );
      },
    );
  }
  
  int getServiceIndexByName(List services, String serviceName) {
    return services.indexWhere((service) => service['name'] == serviceName);
  }

  @override
  Widget build(BuildContext context) {
    final servicesDataJson = Provider.of<ServicesDataJson>(context);
    final historyItems = servicesDataJson.history;
    return Scaffold(
      appBar: CustomAreaAppBar(),
      body: ListView.separated(
        padding: const EdgeInsets.all(8.0),
        itemCount: historyItems.length,
        itemBuilder: (context, index) {
          final services = Provider.of<ServicesDataJson>(context, listen: false).services;
          final item = historyItems[index];
          String imageUrl1 = services.isNotEmpty ? services[getServiceIndexByName(services, item["Action_Service"].toString())]['picture'] : '';
          String imageUrl2 = services.isNotEmpty ? services[getServiceIndexByName(services, item["Reaction_Service"].toString())]['picture'] : '';
        
          return InkWell(
            onTap: () => showDetailsDialog(item, index),
            child: Card(
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 20.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    Image.network(
                      imageUrl1,
                      width: 50,
                      errorBuilder: (context, error, stackTrace) => const Icon(Icons.error),
                    ),
                    const Icon(Icons.arrow_forward),
                    Image.network(
                      imageUrl2,
                      width: 50,
                      errorBuilder: (context, error, stackTrace) => const Icon(Icons.error),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
        separatorBuilder: (context, index) => const SizedBox(height: 25),
      ),
      bottomNavigationBar: const CustomBottomNavigationBar(selectedIndex: 1),
    );
  }
}
