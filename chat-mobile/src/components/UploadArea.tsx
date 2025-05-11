import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { colors } from '../theme/colors';

interface UploadAreaProps {
  onFileSelect: (file: DocumentPicker.DocumentResult) => void;
}

export default function UploadArea({ onFileSelect }: UploadAreaProps) {
  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: false,
      });
      
      if (result.type === 'success') {
        onFileSelect(result);
      }
    } catch (err) {
      console.error('Error picking document:', err);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handleFilePick}
    >
      <View style={styles.uploadBox}>
        <Ionicons name="cloud-upload-outline" size={48} color={colors.primary} />
        <Text style={styles.mainText}>Drag and Drop Or</Text>
        <TouchableOpacity style={styles.browseButton}>
          <Text style={styles.browseText}>Browse File</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  mainText: {
    color: colors.text.primary,
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  browseButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  browseText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 