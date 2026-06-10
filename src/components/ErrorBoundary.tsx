import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { c } from './tokens';
import { reportError } from '@/services/crashReporting';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    reportError(error, { errorInfo });
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>⚠️</Text>
          <Text style={styles.title}>Une erreur est survenue</Text>
          <Text style={styles.subtitle}>
            L'application a rencontré un problème inattendu.
          </Text>
          {__DEV__ && this.state.error && (
            <Text style={styles.errorText}>{this.state.error.message}</Text>
          )}
          <TouchableOpacity style={styles.button} onPress={this.handleRestart}>
            <Text style={styles.buttonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#F0F0F0',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(240,240,240,0.40)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#FF4D4D',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#7FE300',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#111111',
  },
});
