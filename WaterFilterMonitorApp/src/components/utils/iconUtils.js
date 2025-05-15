import { AntDesign } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { EvilIcons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { Fontisto } from '@expo/vector-icons';
import { Foundation } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { Octicons } from '@expo/vector-icons';
import { SimpleLineIcons } from '@expo/vector-icons';
import { Zocial } from '@expo/vector-icons';


export const renderIcon = (iconLib, iconName, isSelected) => {
    const color = isSelected ? '#fff' : '#333';
    const size = 20;
  
    const iconProps = { name: iconName, size, color, style: { marginRight: 6 } };
  
    switch (iconLib) {
      case 'AntDesign':
        return <AntDesign {...iconProps} />;
      case 'Entypo':
        return <Entypo {...iconProps} />;
      case 'EvilIcons':
        return <EvilIcons {...iconProps} />;
      case 'Feather':
        return <Feather {...iconProps} />;
      case 'FontAwesome':
        return <FontAwesome {...iconProps} />;
      case 'FontAwesome5':
        return <FontAwesome5 {...iconProps} />;
      case 'Fontisto':
        return <Fontisto {...iconProps} />;
      case 'Foundation':
        return <Foundation {...iconProps} />;
      case 'Ionicons':
        return <Ionicons {...iconProps} />;
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons {...iconProps} />;
      case 'MaterialIcons':
        return <MaterialIcons {...iconProps} />;
      case 'Octicons':
        return <Octicons {...iconProps} />;
      case 'SimpleLineIcons':
        return <SimpleLineIcons {...iconProps} />;
      case 'Zocial':
        return <Zocial {...iconProps} />;
      default:
        return null;
    }
  };
  