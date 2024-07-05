// assets
import { GithubOutlined, QuestionOutlined, BugOutlined, MailOutlined } from '@ant-design/icons';
import { useTheme } from '@mui/material/styles';

/* //i18next
import { useTranslation, Trans } from 'react-i18next';
const { t } = useTranslation();

//translate visible text
const helpDiscussions = "{t('Help & Discussions')}";
const documentation = "{t('Documentation')}";
const bug = "{t('Found a Bug?')}"; */

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
            id: 'discussions',
            title: 'HelpDiscussion',
            type: 'item',
            url: 'https://github.com/aseracorp/resiOS/discussions',
            icon: MailOutlined,
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
            url: 'https://github.com/aseracorp/resiOS/issues',
            icon: BugOutlined,
            external: true,
            target: true
        }
    ]
};

export default support;
