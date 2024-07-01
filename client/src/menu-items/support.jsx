// assets
import { GithubOutlined, QuestionOutlined, BugOutlined } from '@ant-design/icons';
import DiscordOutlined from '../assets/images/icons/discord.svg'
import DiscordOutlinedWhite from '../assets/images/icons/discord_white.svg'
import { useTheme } from '@mui/material/styles';

// ==============================|| MENU ITEMS - SAMPLE PAGE & DOCUMENTATION ||============================== //

const DiscordOutlinedIcon = (props) => {
    const theme = useTheme();
    return (
        <img src={
            theme.palette.mode === 'dark' ? DiscordOutlinedWhite : DiscordOutlined} width="16px" alt="Discord" {...props} />
    );
};

const support = {
    id: 'support',
    title: 'Support',
    type: 'group',
    children: [
        {
            id: 'helpdesk',
            title: 'Helpdesk (E-Mail)',
            type: 'item',
            url: 'mailto:support@asera.ch',
            icon: GithubOutlined,
            external: true,
            target: true
        },
        {
            id: 'github',
            title: 'Github',
            type: 'item',
            url: 'https://github.com/aseracorp/resiOS',
            icon: GithubOutlined,
            external: true,
            target: true
        },
        {
            id: 'documentation',
            title: 'Documentation',
            type: 'item',
            url: 'https://cosmos-cloud.io/doc',
            icon: QuestionOutlined,
            external: true,
            target: true
        },
        {
            id: 'bug',
            title: 'Found a Bug?',
            type: 'item',
            url: 'https://github.com/aseracorp/resiOS/issues/new/choose',
            icon: BugOutlined,
            external: true,
            target: true
        }
    ]
};

export default support;
