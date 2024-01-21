import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:tasktie/utils/extensions.dart';
import '../main.dart';
import 'create_area_page.dart';
import '../values/app_routes.dart';

class ParameterPage extends StatefulWidget {
  final String serviceName;
  final int serviceId;
  final int actionOrReactionIndex;
  final bool isReaction;
  final List<String> parameters;

  ParameterPage({
    Key? key,
    required this.serviceName,
    required this.serviceId,
    required this.actionOrReactionIndex,
    required this.isReaction,
    required this.parameters,
  }) : super(key: key);

  @override
  _ParameterPageState createState() => _ParameterPageState(isReaction: isReaction);
}

class _ParameterPageState extends State<ParameterPage> {
  late List<TextEditingController> controllers;
    final bool isReaction;

  _ParameterPageState({required this.isReaction});

  @override
  void initState() {
    super.initState();
    controllers = List.generate(widget.parameters.length, (index) => TextEditingController());
  }

  @override
  void dispose() {
    for (var controller in controllers) {
      controller.dispose();
    }
    super.dispose();
  }

  bool get isFormFilled => controllers.every((controller) => controller.text.isNotEmpty);

  void onValidate() {
    if (isFormFilled) {
      final servicesData = Provider.of<ServiceData>(context, listen: false);
      List<String> params = controllers.map((controller) => controller.text).toList();
      if (!widget.isReaction) {
        servicesData.updateService1(widget.serviceName, widget.serviceId, widget.actionOrReactionIndex, params);
        AppRoutes.createArea.pushReplacementName();
      } else {
        servicesData.updateService2(widget.serviceName, widget.serviceId, widget.actionOrReactionIndex, params);
        AppRoutes.createArea.pushReplacementName();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Settings for ${isReaction ? "reaction" : "action"}', style: TextStyle(fontSize: 20),),
      ),
      body: Center(
        child: SingleChildScrollView(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              for (int i = 0; i < widget.parameters.length; i++)
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: SizedBox(
                    width: 300,
                    child: TextField(
                      controller: controllers[i],
                      decoration: InputDecoration(
                        labelText: widget.parameters[i],
                      ),
                      onChanged: (value) {
                        setState(() {});
                      },
                    ),
                  ),
                ),
              const SizedBox(height: 15),
              ElevatedButton(
                onPressed: isFormFilled ? onValidate : null,
                style: ElevatedButton.styleFrom(
                  primary: Colors.black,
                  onPrimary: Colors.white,
                  padding: EdgeInsets.symmetric(vertical: 15, horizontal: 30),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  onSurface: Colors.black
                ),
                child: Text(
                  'Confirm',
                  style: TextStyle(color: Colors.white),
                ),
              ),
              const SizedBox(height: 25),
            ],
          ),
        ),
      ),
    );
  }
}
