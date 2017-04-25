import { Platform } from 'react-native';

const isAndroid = Platform.OS === 'android';

const Icons = {
    androidCalendar: '\uf101',
    androidClock: '\uf102',
    androidConsulting: '\uf103',
    androidList: '\uf104',
    androidProfile: '\uf105',
    androidWarning: '\uf106',
    indicators: '\uf107',
    iosCalendar: '\uf108',
    iosConsulting: '\uf109',
    iosList: '\uf10a',
    iosProfile: '\uf10b',
};

Icons.calendar = isAndroid ? Icons.androidCalendar : Icons.iosCalendar;
Icons.consulting = isAndroid ? Icons.androidConsulting : Icons.iosConsulting;
Icons.list = isAndroid ? Icons.androidList : Icons.iosList;
Icons.profile = isAndroid ? Icons.androidProfile : Icons.iosProfile;

export default Icons;
