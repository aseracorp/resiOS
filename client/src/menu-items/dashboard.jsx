// assets
import { HomeOutlined, AppstoreOutlined, DashboardOutlined, AppstoreAddOutlined } from '@ant-design/icons';

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
            url: '/resios-ui/',
            icon: icons.HomeOutlined,
            breadcrumbs: false
        },
        {
            id: 'dashboard',
            title: 'Monitoring',
            type: 'item',
            url: '/resios-ui/monitoring',
            icon: DashboardOutlined,
            breadcrumbs: false,
            adminOnly: true
        },
        {
            id: 'market',
            title: 'Market',
            type: 'item',
            url: '/resios-ui/market-listing',
            icon: AppstoreAddOutlined,
            breadcrumbs: false
        },
    ]
};

export default dashboard;
