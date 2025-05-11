import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { api } from '../services/api';
import { Document } from '../types/api';

interface DocumentUploaderProps {
  onUploadComplete: (document: Document) => void;
}

export default function DocumentUploader({ onUploadComplete }: DocumentUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'application/msword', 
               'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        setFileName(result.name);
        setUploading(true);

        // Create form data
        const formData = new FormData();
        formData.append('file', {
          uri: result.uri,
          type: result.mimeType || 'application/octet-stream',
          name: result.name,
        } as any);

        try {
          const document = await api.uploadDocument(formData as any);
          onUploadComplete(document);
          Alert.alert('Success', 'Document uploaded successfully');
        } catch (error) {
          Alert.alert('Error', 'Failed to upload document');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    } finally {
      setUploading(false);
      setFileName(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="cloud-upload-outline" size={48} color={colors.primary} />
        <Text style={styles.title}>Upload Document</Text>
        <Text style={styles.subtitle}>
          Supported formats: PDF, TXT, DOC, DOCX
        </Text>

        {uploading ? (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.uploadingText}>Uploading {fileName}...</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
            <Text style={styles.uploadButtonText}>Select Document</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 8,
    marginBottom: 32,
    textAlign: 'center',
  },
  uploadButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
  },
  uploadButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  uploadingContainer: {
    alignItems: 'center',
  },
  uploadingText: {
    marginTop: 16,
    fontSize: 14,
    color: colors.text.secondary,
  },
}); 