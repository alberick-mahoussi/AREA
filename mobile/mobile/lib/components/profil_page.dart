import 'package:flutter/material.dart';
import 'package:tasktie/components/CustomAppBar.dart';
import 'package:tasktie/components/custom_bottom_navigation_bar.dart';
import 'package:provider/provider.dart';
import 'create_area_page.dart';

class ProfilePage extends StatefulWidget {
  @override
  _ProfilePageState createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  String username = '';
  String email = '';
  final passwordController = TextEditingController();
  final usernameController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final servicesDataJson = Provider.of<ServicesDataJson>(context, listen: false);
      await Future.wait([
        servicesDataJson.userInformation(context),
      ]);
    });
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAreaAppBar(),
      body: SingleChildScrollView(
        child: Center(
          child:
          Padding(
            padding: const EdgeInsets.all(40.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                const CircleAvatar(
                  radius: 60,
                  backgroundImage: AssetImage('assets/img/profil.png'),
                ),
                const SizedBox(height: 64),
                Align(
                  alignment: Alignment.centerLeft,
                  child: Consumer<ServicesDataJson>(
                    builder: (context, servicesDataJson, child) {
                      return Text(
                        'Email : ${servicesDataJson.client['user']['email']}',
                        style: TextStyle(fontSize: 20),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(
                      child: Consumer<ServicesDataJson>(
                        builder: (context, servicesDataJson, child) {
                          return Text(
                            'Username : ${servicesDataJson.client['user']['username']}',
                            style: TextStyle(fontSize: 20),
                          );
                        },
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.edit),
                      onPressed: () => _showEditDialog(
                        context,
                        'Change Username',
                        usernameController,
                        (value) => setState(() => username = value),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    const Expanded(
                      child: Text(
                        'Password : ••••••••',
                        style: TextStyle(fontSize: 20),
                      ),
                    ),
                    IconButton(
                      icon: Icon(Icons.edit),
                      onPressed: () => _showChangePasswordDialog(context),
                    ),
                  ],
                ),
                // Ajoutez d'autres éléments si nécessaire.
              ],
            ),
          ),
        ),
      ),
      bottomNavigationBar: const CustomBottomNavigationBar(selectedIndex: 3),
    );
  }

  void _showEditDialog(
    BuildContext context,
    String title,
    TextEditingController controller,
    Function(String) onConfirm,
  ) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text(title),
          content: TextField(
            controller: controller,
            decoration: InputDecoration(hintText: "username"),
          ),
          actions: <Widget>[
            TextButton(
              child: Text('Cancel'),
              onPressed: () => Navigator.of(context).pop(),
            ),
            TextButton(
              child: Text('Confirm'),
              onPressed: () {
                Provider.of<ServicesDataJson>(context, listen: false).updateUsername(context, controller.text);
                controller.text = "";
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      },
    );
  }

void _showChangePasswordDialog(BuildContext context) {
    final newPasswordController = TextEditingController();
    final confirmPasswordController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('Change Password'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: newPasswordController,
                decoration: InputDecoration(hintText: "Enter new password"),
                obscureText: true,
              ),
              TextField(
                controller: confirmPasswordController,
                decoration: InputDecoration(hintText: "Confirm new password"),
                obscureText: true,
              ),
            ],
          ),
          actions: <Widget>[
            TextButton(
              child: Text('Cancel'),
              onPressed: () {
                newPasswordController.dispose();
                confirmPasswordController.dispose();
                Navigator.of(context).pop();
              },
            ),
            TextButton(
              child: Text('Confirm'),
              onPressed: () {
                if (newPasswordController.text == confirmPasswordController.text) {
                  Provider.of<ServicesDataJson>(context, listen: false).updatePassword(context, newPasswordController.text);
                  newPasswordController.text = "";
                  confirmPasswordController.text = "";
                  Navigator.of(context).pop();
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text("The passwords do not match. Please try again."),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              },
            ),
          ],
        );
      },
    );
  }
}