import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.PRIMARY,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionStatus: {
    fontSize: 14,
    color: 'white',
    marginLeft: 4,
  },
  connected: {
    color: '#4ADE80',
    fontWeight: 'bold',
  },
  disconnected: {
    color: '#F87171',
    fontWeight: 'bold',
  },
});
