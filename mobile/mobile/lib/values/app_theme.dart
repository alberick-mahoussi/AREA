import 'package:flutter/material.dart';

import 'app_colors.dart';

class AppTheme {
  static final textFormFieldBorder = OutlineInputBorder(
    borderRadius: BorderRadius.circular(12),
    borderSide: const BorderSide(
      color: AppColors.grey,
      width: 1.6,
    ),
  );

  static final ThemeData themeData = ThemeData(
    useMaterial3: true,
    colorSchemeSeed: AppColors.links,
    scaffoldBackgroundColor: Colors.white,
    textTheme: const TextTheme(
      titleLarge: TextStyle(
        fontWeight: FontWeight.bold,
        color: Colors.white,
        fontSize: 34,
        letterSpacing: 0.5,
      ),
      bodySmall: TextStyle(
        color: Colors.grey,
        fontSize: 14,
        letterSpacing: 0.5,
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.transparent,
      errorStyle: const TextStyle(
        fontSize: 12,
      ),
      contentPadding: const EdgeInsets.symmetric(
        horizontal: 24,
        vertical: 14,
      ),
      border: textFormFieldBorder,
      errorBorder: textFormFieldBorder,
      focusedBorder: textFormFieldBorder,
      focusedErrorBorder: textFormFieldBorder,
      enabledBorder: textFormFieldBorder,
      labelStyle: const TextStyle(
        fontSize: 17,
        color: Colors.grey,
        fontWeight: FontWeight.w500,
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: AppColors.links,
        padding: const EdgeInsets.symmetric(
          horizontal: 12,
          vertical: 4,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.links,
        minimumSize: const Size(double.infinity, 50),
        side: BorderSide(
          color: Colors.grey.shade200,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: ButtonStyle(
        minimumSize: MaterialStateProperty.all<Size>(
          const Size(double.infinity, 52),
        ),
        shape: MaterialStateProperty.all(
          RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        foregroundColor: MaterialStateProperty.all<Color>(
          Colors.black,
        ),
        textStyle: MaterialStateProperty.all<TextStyle>(
          const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w500,
          ),
        ),
        backgroundColor: MaterialStateProperty.all<Color>(
          Colors.white,
        ),
        // Ajouter une couleur d'overlay pour l'animation de pression
        overlayColor: MaterialStateProperty.resolveWith<Color?>(
          (states) {
            if (states.contains(MaterialState.pressed)) {
              return Colors.grey.withOpacity(
                  0.2); // Ajustez la couleur et l'opacité selon vos préférences
            }
            return null; // Pas de couleur d'overlay par défaut
          },
        ),
        // Ajouter une élévation pour l'effet d'élévation lors de la pression
        elevation: MaterialStateProperty.resolveWith<double>(
          (states) {
            if (states.contains(MaterialState.pressed)) {
              return 5.0; // Ajustez la valeur d'élévation selon vos préférences
            }
            return 0; // Élévation par défaut
          },
        ),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        primary: Colors.white,
        onPrimary: Colors.black,
        side: BorderSide(color: AppColors.white, width: 1),
      ),
    ),
  );
}
