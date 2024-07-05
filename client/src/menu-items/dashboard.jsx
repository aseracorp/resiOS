// assets
import { HomeOutlined, AppstoreOutlined, DashboardOutlined, AppstoreAddOutlined } from '@ant-design/icons';

/* //i18next
import { useTranslation, Trans } from 'react-i18next';
const { t } = useTranslation();

//translate visible text
const monitoring = "{t('Monitoring')}";
const market = "{t('Market')}"; */

// icons
const icons = {
    HomeOutlined
};

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const dashboard = {
    id: 'group-dashboard',
    title: 'Navigation',
    type: 'group',
    children: [
        {
            id: 'home',
            title: 'Home',
            type: 'item',
            url: '/cosmos-ui/',
            icon: icons.HomeOutlined,
            breadcrumbs: false
        },
        {
            id: 'dashboard',
            title: 'Monitoring',
            type: 'item',
            url: '/cosmos-ui/monitoring',
            icon: DashboardOutlined,
            breadcrumbs: false,
            adminOnly: true
        },
        {
            id: 'market',
            title: 'Market',
            type: 'item',
            url: '/cosmos-ui/market-listing',
            icon: AppstoreAddOutlined,
            breadcrumbs: false
        },
    ]
};

export default dashboard;
