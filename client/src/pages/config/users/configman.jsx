import * as React from 'react';
import * as API from '../../../api';
import MainCard from '../../../components/MainCard';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';
import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  InputLabel,
  OutlinedInput,
  Stack,
  FormHelperText,
  TextField,
  MenuItem,
  Skeleton,
  Tooltip,
} from '@mui/material';
import RestartModal from './restart';
import { DeleteOutlined, QuestionCircleOutlined, SyncOutlined, WarningFilled } from '@ant-design/icons';
import { CosmosCheckbox, CosmosCollapse, CosmosFormDivider, CosmosInputPassword, CosmosInputText, CosmosSelect } from './formShortcuts';
import CountrySelect from '../../../components/countrySelect';
import { DnsChallengeComp } from '../../../utils/dns-challenge-comp';

import UploadButtons from '../../../components/fileUpload';
import { SliderPicker
 } from 'react-color';
 import { LoadingButton } from '@mui/lab';

 // TODO: Remove circular deps
 import {SetPrimaryColor, SetSecondaryColor} from '../../../App';
import { useClientInfos } from '../../../utils/hooks';
import ConfirmModal from '../../../components/confirmModal';
import { DownloadFile } from '../../../api/downloadButton';
import { isDomain } from '../../../utils/indexs';

import { Trans, useTranslation } from 'react-i18next';

const ConfigManagement = () => {
  const { t } = useTranslation();
  const [config, setConfig] = React.useState(null);
  const [openModal, setOpenModal] = React.useState(false);
  const [openResartModal, setOpenRestartModal] = React.useState(false);
  const [uploadingBackground, setUploadingBackground] = React.useState(false);
  const [saveLabel, setSaveLabel] = React.useState(t('global.saveAction'));
  const {role} = useClientInfos();
  const isAdmin = role === "2";

  function refresh() {
    API.config.get().then((res) => {
      setConfig(res.data);
    });
  }

  function getRouteDomain(domain) {
    let parts = domain.split('.');
    return parts[parts.length - 2] + '.' + parts[parts.length - 1];
  }

  React.useEffect(() => {
    refresh();
  }, []);

  return <div style={{maxWidth: '1000px', margin: ''}}>
    <Stack direction="row" spacing={2} style={{marginBottom: '15px'}}>
      <Button variant="contained" color="primary" startIcon={<SyncOutlined />} onClick={() => {
          refresh();
      }}>{t('management.configuration.header.refreshButton.refreshLabel')}</Button>

      {isAdmin && <Button variant="outlined" color="primary" startIcon={<SyncOutlined />} onClick={() => {
          setOpenRestartModal(true);
      }}>{t('management.configuration.header.restartButton.restartLabel')}</Button>}
      
      <ConfirmModal variant="outlined" color="warning" startIcon={<DeleteOutlined />} callback={() => {
          API.metrics.reset().then((res) => {
            refresh();
          });
      }}
      label={t('management.configuration.header.purgeMetricsButton.purgeMetricsLabel')} 
      content={t('management.configuration.header.purgeMetricsButton.purgeMetricsPopUp.cofirmAction')} />
    </Stack>
    
    {config && <>
      <RestartModal openModal={openModal} setOpenModal={setOpenModal} config={config} />
      <RestartModal openModal={openResartModal} setOpenModal={setOpenRestartModal} />

      
      <Formik
        initialValues={{
          MongoDB: config.MongoDB,
          LoggingLevel: config.LoggingLevel,
          RequireMFA: config.RequireMFA,
          GeoBlocking: config.BlockedCountries,
          CountryBlacklistIsWhitelist: config.CountryBlacklistIsWhitelist,
          AutoUpdate: config.AutoUpdate,

          Hostname: config.HTTPConfig.Hostname,
          GenerateMissingTLSCert: config.HTTPConfig.GenerateMissingTLSCert,
          GenerateMissingAuthCert: config.HTTPConfig.GenerateMissingAuthCert,
          HTTPPort: config.HTTPConfig.HTTPPort,
          HTTPSPort: config.HTTPConfig.HTTPSPort,
          SSLEmail: config.HTTPConfig.SSLEmail,
          UseWildcardCertificate: config.HTTPConfig.UseWildcardCertificate,
          HTTPSCertificateMode: config.HTTPConfig.HTTPSCertificateMode,
          DNSChallengeProvider: config.HTTPConfig.DNSChallengeProvider,
          DNSChallengeConfig: config.HTTPConfig.DNSChallengeConfig,
          ForceHTTPSCertificateRenewal: config.HTTPConfig.ForceHTTPSCertificateRenewal,
          OverrideWildcardDomains: config.HTTPConfig.OverrideWildcardDomains,
          UseForwardedFor: config.HTTPConfig.UseForwardedFor,
          AllowSearchEngine: config.HTTPConfig.AllowSearchEngine,
          AllowHTTPLocalIPAccess: config.HTTPConfig.AllowHTTPLocalIPAccess,

          Email_Enabled: config.EmailConfig.Enabled,
          Email_Host: config.EmailConfig.Host,
          Email_Port: config.EmailConfig.Port,
          Email_Username: config.EmailConfig.Username,
          Email_Password: config.EmailConfig.Password,
          Email_From: config.EmailConfig.From,
          Email_UseTLS : config.EmailConfig.UseTLS,
          Email_AllowInsecureTLS : config.EmailConfig.AllowInsecureTLS,

          SkipPruneNetwork: config.DockerConfig.SkipPruneNetwork,
          SkipPruneImages: config.DockerConfig.SkipPruneImages,
          DefaultDataPath: config.DockerConfig.DefaultDataPath || "/usr",

          Background: config && config.HomepageConfig && config.HomepageConfig.Background,
          Expanded: config && config.HomepageConfig && config.HomepageConfig.Expanded,
          PrimaryColor: config && config.ThemeConfig && config.ThemeConfig.PrimaryColor,
          SecondaryColor: config && config.ThemeConfig && config.ThemeConfig.SecondaryColor,
        
          MonitoringEnabled: !config.MonitoringDisabled,

          BackupOutputDir: config.BackupOutputDir,

          AdminWhitelistIPs: config.AdminWhitelistIPs && config.AdminWhitelistIPs.join(', '),
          AdminConstellationOnly: config.AdminConstellationOnly,

          PuppetModeEnabled: config.Database.PuppetMode,
          PuppetModeHostname: config.Database.Hostname,
          PuppetModeDbVolume: config.Database.DbVolume,
          PuppetModeConfigVolume: config.Database.ConfigVolume,
          PuppetModeVersion: config.Database.Version,
          PuppetModeUsername: config.Database.Username,
          PuppetModePassword: config.Database.Password,
        }}

        validationSchema={Yup.object().shape({
          Hostname: Yup.string().max(255).required(t('management.configuration.http.hostnameInput.HostnameValidation')),
          MongoDB: Yup.string().max(512),
          LoggingLevel: Yup.string().max(255).required(t('management.configuration.general.logLevelInput.logLevelValidation')),
        })}

        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          setSubmitting(true);
        
          let toSave = {
            ...config,
            MongoDB: values.MongoDB,
            Database: {
              ...config.Database,
              PuppetMode: values.PuppetModeEnabled,
              Hostname: values.PuppetModeHostname,
              DbVolume: values.PuppetModeDbVolume,
              ConfigVolume: values.PuppetModeConfigVolume,
              Version: values.PuppetModeVersion,
              Username: values.PuppetModeUsername,
              Password: values.PuppetModePassword,
            },
            LoggingLevel: values.LoggingLevel,
            RequireMFA: values.RequireMFA,
            // AutoUpdate: values.AutoUpdate,
            BlockedCountries: values.GeoBlocking,
            CountryBlacklistIsWhitelist: values.CountryBlacklistIsWhitelist,
            MonitoringDisabled: !values.MonitoringEnabled,
            BackupOutputDir: values.BackupOutputDir,
            AdminConstellationOnly: values.AdminConstellationOnly,
            AdminWhitelistIPs: (values.AdminWhitelistIPs && values.AdminWhitelistIPs != "") ?
              values.AdminWhitelistIPs.split(',').map((x) => x.trim()) : [],
            HTTPConfig: {
              ...config.HTTPConfig,
              Hostname: values.Hostname,
              GenerateMissingAuthCert: values.GenerateMissingAuthCert,
              HTTPPort: values.HTTPPort,
              HTTPSPort: values.HTTPSPort,
              SSLEmail: values.SSLEmail,
              UseWildcardCertificate: values.UseWildcardCertificate,
              HTTPSCertificateMode: values.HTTPSCertificateMode,
              DNSChallengeProvider: values.DNSChallengeProvider,
              DNSChallengeConfig: values.DNSChallengeConfig,
              ForceHTTPSCertificateRenewal: values.ForceHTTPSCertificateRenewal,
              OverrideWildcardDomains: values.OverrideWildcardDomains.replace(/\s/g, ''),
              UseForwardedFor: values.UseForwardedFor,
              AllowSearchEngine: values.AllowSearchEngine,
              AllowHTTPLocalIPAccess: values.AllowHTTPLocalIPAccess,
            },
            EmailConfig: {
              ...config.EmailConfig,
              Enabled: values.Email_Enabled,
              Host: values.Email_Host,
              Port: values.Email_Port,
              Username: values.Email_Username,
              Password: values.Email_Password,
              From: values.Email_From,
              UseTLS: values.Email_UseTLS,
              AllowInsecureTLS: values.Email_AllowInsecureTLS,
            },
            DockerConfig: {
              ...config.DockerConfig,
              SkipPruneNetwork: values.SkipPruneNetwork,
              SkipPruneImages: values.SkipPruneImages,
              DefaultDataPath: values.DefaultDataPath
            },
            HomepageConfig: {
              ...config.HomepageConfig,
              Background: values.Background,
              Expanded: values.Expanded
            },
            ThemeConfig: {
              ...config.ThemeConfig,
              PrimaryColor: values.PrimaryColor,
              SecondaryColor: values.SecondaryColor
            },
          }
          
          return API.config.set(toSave).then((data) => {
            setOpenModal(true);
            setSaveLabel(t('global.savedConfirmation'));
            setTimeout(() => {
              setSaveLabel(t('global.saveAction'));
            }, 3000);
          }).catch((err) => {
            setOpenModal(true);
            setSaveLabel(t('global.savedError'));
            setTimeout(() => {
              setSaveLabel(t('global.saveAction'));
            }, 3000);
          });
        }}
      >
        {(formik) => (
          <form noValidate onSubmit={formik.handleSubmit}>
            <Stack spacing={3}>
            {isAdmin && <MainCard>
                {formik.errors.submit && (
                  <Grid item xs={12}>
                    <FormHelperText error>{formik.errors.submit}</FormHelperText>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <LoadingButton
                      disableElevation
                      loading={formik.isSubmitting}
                      fullWidth
                      size="large"
                      type="submit"
                      variant="contained"
                      color="primary"
                    >
                      {saveLabel}
                    </LoadingButton>
                </Grid>
              </MainCard>}

              {!isAdmin && <div>
                <Alert severity="warning">{t('management.configuration.general.notAdminWarning')} 
                </Alert>
              </div>} 

              <MainCard title={t('management.configuration.generalTitle')}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Alert severity="info">{t('management.configuration.general.configFileInfo')}</Alert>
                  </Grid>

                  <CosmosCheckbox
                    label={t('management.configuration.general.forceMfaCheckbox.forceMfaLabel')}
                    name="RequireMFA"
                    formik={formik}
                    helperText={t('management.configuration.general.forceMfaCheckbox.forceMfaHelperText')}
                  />
                  
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="MongoDB-login">{t('management.configuration.general.mongoDbInput')}</InputLabel>
                      <OutlinedInput
                        id="MongoDB-login"
                        type="password"
                        autoComplete='new-password'
                        value={formik.values.MongoDB}
                        name="MongoDB"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        placeholder="MongoDB"
                        fullWidth
                        error={Boolean(formik.touched.MongoDB && formik.errors.MongoDB)}
                      />
                      {formik.touched.MongoDB && formik.errors.MongoDB && (
                        <FormHelperText error id="standard-weight-helper-text-MongoDB-login">
                          {formik.errors.MongoDB}
                        </FormHelperText>
                      )}
                      <CosmosCollapse title={t('management.configuration.general.puppetModeTitle')}>
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <CosmosCheckbox
                              label={t('management.configuration.general.puppetMode.enableCheckbox.enableLabel')}
                              name="PuppetModeEnabled"
                              formik={formik}
                              helperText={t('management.configuration.general.puppetMode.enableCheckbox.enableHelperText')}
                            />

                            {formik.values.PuppetModeEnabled && (
                              <Grid container spacing={3}>
                                <Grid item xs={12}>
                                  <CosmosInputText
                                    label={t('management.configuration.general.puppetMode.hostnameInput.hostnameLabel')}
                                    name="PuppetModeHostname"
                                    formik={formik}
                                    helperText={t('management.configuration.general.puppetMode.hostnameInput.hostnameHelperText')}
                                  />
                                </Grid>

                                <Grid item xs={12}>
                                  <CosmosInputText
                                    label={t('management.configuration.general.puppetMode.dbVolumeInput.dbVolumeLabel')}
                                    name="PuppetModeDbVolume"
                                    formik={formik}
                                    helperText={t('management.configuration.general.puppetMode.dbVolumeInput.dbVolumeHelperText')}
                                  />

                                  <CosmosInputText
                                    label={t('management.configuration.general.puppetMode.configVolumeInput.configVolumeLabel')}
                                    name="PuppetModeConfigVolume"
                                    formik={formik}
                                    helperText={t('management.configuration.general.puppetMode.configVolumeInput.configVolumeHelperText')}
                                  />
                                  
                                  <CosmosInputText
                                    label={t('management.configuration.general.puppetMode.versionInput.versionLabel')}
                                    name="PuppetModeVersion"
                                    formik={formik}
                                    helperText={t('management.configuration.general.puppetMode.versionInput.versionHelperText')}
                                  />
                                </Grid>

                                <Grid item xs={12}>
                                  <CosmosInputText
                                    label={t('management.configuration.general.puppetMode.usernameInput.usernameLabel')}
                                    name="PuppetModeUsername"
                                    formik={formik}
                                    helperText={t('management.configuration.general.puppetMode.usernameInput.usernameHelperText')}
                                  />

                                  <CosmosInputPassword
                                    label={t('management.configuration.general.puppetMode.passwordInput.passwordLabel')}
                                    name="PuppetModePassword"
                                    autoComplete='new-password'
                                    formik={formik}
                                    helperText={t('management.configuration.general.puppetMode.passwordInput.passwordHelperText')}
                                    noStrength
                                  />
                                </Grid>
                              </Grid>
                            )}
                          </Grid>
                        </Grid>
                      </CosmosCollapse>
                    </Stack>
                  </Grid>

                  <CosmosInputText
                    label={t('management.configuration.general.backupDirInput.backupDirLabel')}
                    name="BackupOutputDir"
                    formik={formik}
                    helperText={t('management.configuration.general.backupDirInput.backupDirHelperText')}
                  />
                  
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="LoggingLevel-login">{t('management.configuration.general.logLevelInput')}</InputLabel>
                      <TextField
                        className="px-2 my-2"
                        variant="outlined"
                        name="LoggingLevel"
                        id="LoggingLevel"
                        select
                        value={formik.values.LoggingLevel}
                        onChange={formik.handleChange}
                        error={
                          formik.touched.LoggingLevel &&
                          Boolean(formik.errors.LoggingLevel)
                        }
                        helperText={
                          formik.touched.LoggingLevel && formik.errors.LoggingLevel
                        }
                      >
                        <MenuItem key={"DEBUG"} value={"DEBUG"}>
                          DEBUG
                        </MenuItem>
                        <MenuItem key={"INFO"} value={"INFO"}>
                          INFO
                        </MenuItem>
                        <MenuItem key={"WARNING"} value={"WARNING"}>
                          WARNING
                        </MenuItem>
                        <MenuItem key={"ERROR"} value={"ERROR"}>
                          ERROR
                        </MenuItem>
                      </TextField>
                    </Stack>
                  </Grid>

                  <CosmosCheckbox
                    label={t('management.configuration.general.monitoringCheckbox.monitoringLabel')}
                    name="MonitoringEnabled"
                    formik={formik}
                  />
                </Grid>
              </MainCard>
              
              <MainCard title={t('Appearance')}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    {!uploadingBackground && formik.values.Background && <img src=
                      {formik.values.Background} alt={t('management.configuration.appearance.uploadWallpaperButton.previewBrokenError')}
                      width={285} />}
                    {uploadingBackground && <Skeleton variant="rectangular" width={285} height={140} />}
                     <Stack spacing={1} direction="row">
                      <UploadButtons
                        accept='.jpg, .png, .gif, .jpeg, .webp, .bmp, .avif, .tiff, .svg'
                        label={t('management.configuration.appearance.uploadWallpaperButton.uploadWallpaperLabel')}
                        OnChange={(e) => {
                          setUploadingBackground(true);
                          const file = e.target.files[0];
                          API.uploadImage(file, "background").then((data) => {
                            formik.setFieldValue('Background', data.data.path);
                            setUploadingBackground(false);
                          });
                        }}
                      />

                      <Button
                        variant="outlined"
                        onClick={() => {
                          formik.setFieldValue('Background', "");
                        }}
                      >
                        {t('management.configuration.appearance.resetWallpaperButton.resetWallpaperLabel')}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          formik.setFieldValue('PrimaryColor', "");
                          SetPrimaryColor("");
                          formik.setFieldValue('SecondaryColor', "");
                          SetSecondaryColor("");
                        }}
                      >
                        {t('management.configuration.appearance.resetColorsButton.resetColorsLabel')}
                      </Button>
                    </Stack>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <CosmosCheckbox 
                      label={t('management.configuration.appearance.appDetailsOnHomepageCheckbox.appDetailsOnHomepageLabel')}
                      name="Expanded"
                      formik={formik}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel style={{marginBottom: '10px'}} htmlFor="PrimaryColor">{t('management.configuration.appearance.primaryColorSlider')}</InputLabel>
                      <SliderPicker
                        id="PrimaryColor"
                        color={formik.values.PrimaryColor}
                        onChange={color => {
                          let colorRGB = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`
                          formik.setFieldValue('PrimaryColor', colorRGB);
                          SetPrimaryColor(colorRGB);
                        }}
                      />
                    </Stack>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel style={{marginBottom: '10px'}} htmlFor="SecondaryColor">{t('management.configuration.appearance.secondaryColorSlider')}</InputLabel>
                      <SliderPicker
                        id="SecondaryColor"
                        color={formik.values.SecondaryColor}
                        onChange={color => {
                          let colorRGB = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`
                          formik.setFieldValue('SecondaryColor', colorRGB);
                          SetSecondaryColor(colorRGB);
                        }}
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </MainCard>

              <MainCard title="HTTP">
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="Hostname-login">{t('management.configuration.http.hostnameInput.HostnameLabel')}</InputLabel>
                      <OutlinedInput
                        id="Hostname-login"
                        type="text"
                        value={formik.values.Hostname}
                        name="Hostname"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        placeholder="Hostname"
                        fullWidth
                        error={Boolean(formik.touched.Hostname && formik.errors.Hostname)}
                      />
                      {formik.touched.Hostname && formik.errors.Hostname && (
                        <FormHelperText error id="standard-weight-helper-text-Hostname-login">
                          {formik.errors.Hostname}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>

                  {(formik.values.HTTPSCertificateMode != "DISABLED" || isDomain(formik.values.Hostname)) ? (
                  <Grid item xs={12}>
                      <CosmosCheckbox 
                        label={<span>{t('management.configuration.http.allowInsecureLocalAccessCheckbox.allowInsecureLocalAccessLabel')} &nbsp;
                          <Tooltip title={<span style={{fontSize:'110%'}}><Trans i18nKey="management.configuration.http.allowInsecureLocalAccessCheckbox.allowInsecureLocalAccessTooltip">
                                When HTTPS is used along side a domain, depending on your networking configuration, it is possible that your server is not receiving direct local connections. <br />
                                This option allows you to also access your Cosmos admin using your local IP address, like ip:port. <br />
                                You can already create ip:port URLs for your apps, <strong>but this will make them HTTP-only</strong>.</Trans></span>}>
                                <QuestionCircleOutlined size={'large'} />
                            </Tooltip></span>}
                        name="AllowHTTPLocalIPAccess"
                        formik={formik}
                      />
                      {formik.values.allowHTTPLocalIPAccess && <Alert severity="warning"><Trans i18nKey="management.configuration.http.allowInsecureLocalAccessCheckbox.allowInsecureLocalAccessWarning">
                      This option is not recommended as it exposes your server to security risks on your local network. <br />
                      Your local network is safer than the internet, but not safe, as devices like IoTs, smart-TVs, smartphones or even your router can be compromised. <br />
                      <strong>If you want to have a secure offline / local-only access to a server that uses a domain name and HTTPS, use Constellation instead.</strong>
                      </Trans></Alert>}
                  </Grid>) : ""}

                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="HTTPPort-login">HTTP Port (Default: 80)</InputLabel>
                      <OutlinedInput
                        id="HTTPPort-login"
                        type="text"
                        value={formik.values.HTTPPort}
                        name="HTTPPort"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        placeholder="HTTPPort"
                        fullWidth
                        error={Boolean(formik.touched.HTTPPort && formik.errors.HTTPPort)}
                      />
                      {formik.touched.HTTPPort && formik.errors.HTTPPort && (
                        <FormHelperText error id="standard-weight-helper-text-HTTPPort-login">
                          {formik.errors.HTTPPort}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>

                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="HTTPSPort-login">HTTPS Port (Default: 443)</InputLabel>
                      <OutlinedInput
                        id="HTTPSPort-login"
                        type="text"
                        value={formik.values.HTTPSPort}
                        name="HTTPSPort"
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        placeholder="HTTPSPort"
                        fullWidth
                        error={Boolean(formik.touched.HTTPSPort && formik.errors.HTTPSPort)}
                      />
                      {formik.touched.HTTPSPort && formik.errors.HTTPSPort && (
                        <FormHelperText error id="standard-weight-helper-text-HTTPSPort-login">
                          {formik.errors.HTTPSPort}
                        </FormHelperText>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Alert severity="info">
                      {t('management.configuration.http.allowSearchIndexCheckbox')}<br />
                    </Alert>
                    <CosmosCheckbox 
                      label={t('management.configuration.http.allowSearchIndexCheckbox.allowSearchIndexLabel')}
                      name="AllowSearchEngine"
                      formik={formik}
                    />
                  </Grid>
                  </Grid>
              </MainCard>
              
              <MainCard title="Emails - SMTP">
                <Stack spacing={2}>
                  <Alert severity="info">{t('management.configuration.email.inbobox.label')}.</Alert>

                  <CosmosCheckbox 
                    label={t('management.configuration.email.enableCheckbox.enableLabel')}
                    name="Email_Enabled"
                    formik={formik}
                    helperText={t('management.configuration.email.enableCheckbox.enableHelperText')}
                  />

                  {formik.values.Email_Enabled && (<>
                    <CosmosInputText
                      label="SMTP Host"
                      name="Email_Host"
                      formik={formik}
                      helperText="SMTP Host"
                    />

                    <CosmosInputText
                      label="SMTP Port"
                      name="Email_Port"
                      formik={formik}
                      helperText="SMTP Port"
                    />

                    <CosmosInputText
                      label={t('management.configuration.email.usernameInput.usernameLabel')}
                      name="Email_Username"
                      formik={formik}
                      helperText={t('management.configuration.email.usernameInput.usernameHelperText')}
                    />

                    <CosmosInputPassword
                      label={t('management.configuration.email.passwordInput.passwordLabel')}
                      name="Email_Password"
                      autoComplete='new-password'
                      formik={formik}
                      helperText={t('management.configuration.email.passwordInput.passwordHelperText')}
                      noStrength
                    />

                    <CosmosInputText
                      label={t('management.configuration.email.senderInput.senderLabel')}
                      name="Email_From"
                      formik={formik}
                      helperText={t('management.configuration.email.senderInput.senderHelperText')}
                    />

                    <CosmosCheckbox
                      label={t('management.configuration.email.tlsCheckbox.tlsLabel')}
                      name="Email_UseTLS"
                      formik={formik}
                      helperText={t('management.configuration.email.tlsCheckbox.tlsLabel')}
                    />

                    {formik.values.Email_UseTLS && (
                      <CosmosCheckbox
                        label={t('management.configuration.email.selfSignedCheckbox.SelfSignedLabel')}
                        name="Email_AllowInsecureTLS"
                        formik={formik}
                        helperText={t('management.configuration.email.selfSignedCheckbox.SelfSignedHelperText')}
                      />
                    )}
                  </>)}
                </Stack>
              </MainCard>

              <MainCard title="Docker">
                <Stack spacing={2}>
                  <CosmosCheckbox
                    label={t('management.configuration.docker.skipPruneNetworkCheckbox.skipPruneNetworkLabel')}
                    name="SkipPruneNetwork"
                    formik={formik}
                  />

                  <CosmosCheckbox
                    label={t('management.configuration.docker.skipPruneImageCheckbox.skipPruneImageLabel')}
                    name="SkipPruneImages"
                    formik={formik}
                  />

                  <CosmosInputText
                    label={t('management.configuration.docker.defaultDatapathInput.defaultDatapathLabel')}
                    name="DefaultDataPath"
                    formik={formik}
                    placeholder={'/usr'}
                  />
                </Stack>
              </MainCard>


              <MainCard title={t('global.securityTitle')}>
                  <Grid container spacing={3}>

                  {/* <CosmosCheckbox
                    label={"Read Client IP from X-Forwarded-For header (not recommended)"}
                    name="UseForwardedFor"
                    formik={formik}
                  /> */}

                  <CosmosFormDivider title='Geo-Blocking' />

                  <CosmosCheckbox
                    label={t('management.configuration.security.invertBlacklistCheckbox.invertBlacklistLabel')}
                    name="CountryBlacklistIsWhitelist"
                    formik={formik}
                  />

                  <Grid item xs={12}>
                      <InputLabel htmlFor="GeoBlocking">
                        <Trans i18nKey="management.configuration.security.geoBlockSelection.geoBlockLabel"
                          blockAllow={formik.values.CountryBlacklistIsWhitelist ?
                            t('management.configuration.security.geoBlockSelection.geoBlockLabel.varAllow') :
                            t('management.configuration.security.geoBlockSelection.geoBlockLabel.varBlock')
                          }
                        />
                      </InputLabel>
                  </Grid>

                  <CountrySelect name="GeoBlocking" label={
                    <Trans i18nKey="management.configuration.security.geoBlockSelection.geoBlockLabel"
                      blockAllow={formik.values.CountryBlacklistIsWhitelist ?
                        t('management.configuration.security.geoBlockSelection.varAllow') :
                        t('management.configuration.security.geoBlockSelection.varBlock')
                        }
                    />} formik={formik} />

                  <Grid item xs={12}>
                    <Button onClick={() => {
                      formik.setFieldValue("GeoBlocking", ["CN","RU","TR","BR","BD","IN","NP","PK","LK","VN","ID","IR","IQ","EG","AF","RO",])
                      formik.setFieldValue("CountryBlacklistIsWhitelist", false)
                    }} variant="outlined">{t('management.configuration.security.geoblock.resetToDefaultButton')}</Button>
                  </Grid>
                  
                  <CosmosFormDivider title={t('management.configuration.security.adminRestrictionsTitle')} />

                  <Grid item xs={12}>
                    <Alert severity="info">{t('management.configuration.security.adminRestrictions.adminRestrictionsInfo')}</Alert>
                  </Grid>
                  
                  <CosmosInputText
                    label={t('management.configuration.security.adminRestrictions.adminWhitelistInput.adminWhitelistLabel')}
                    name="AdminWhitelistIPs"
                    formik={formik}
                    helperText={t('management.configuration.security.adminRestrictions.adminWhitelistInput.adminWhitelistHelperText')}
                  />

                  <CosmosCheckbox
                    label={t('management.configuration.security.adminRestrictions.adminConstellationCheckbox.adminConstellationLabel')}
                    name="AdminConstellationOnly"
                    formik={formik}
                  />

                  <CosmosFormDivider title={t('management.configuration.security.encryptionTitle')} />

                  <Grid item xs={12}>
                    <Alert severity="info">{t('management.configuration.security.encryption.enryptionInfo')}</Alert>
                  </Grid>

                  <Grid item xs={12}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                      <Field
                        type="checkbox"
                        name="GenerateMissingAuthCert"
                        as={FormControlLabel}
                        control={<Checkbox size="large" />}
                        label={t('management.configuration.security.encryption.genMissingAuthCheckbox.genMissingAuthLabel')}
                      />
                    </Stack>
                  </Grid>

                  <CosmosSelect
                    name="HTTPSCertificateMode"
                    label={t('management.configuration.security.encryption.httpsCertSelection.httpsCertLabel')}
                    formik={formik}
                    onChange={(e) => {
                      formik.setFieldValue("ForceHTTPSCertificateRenewal", true);
                    }}
                    options={[
                      ["LETSENCRYPT", t('management.configuration.security.encryption.httpsCertSelection.sslLetsEncryptChoice')],
                      ["SELFSIGNED", t('management.configuration.security.encryption.httpsCertSelection.sslSelfSignedChoice')],
                      ["PROVIDED", t('management.configuration.security.encryption.httpsCertSelection.sslProvidedChoice')],
                      ["DISABLED", t('management.configuration.security.encryption.httpsCertSelection.sslDisabledChoice')],
                    ]}
                  />

                  <CosmosCheckbox
                    label={t('management.configuration.security.encryption.wildcardCheckbox.wildcardLabel') + formik.values.Hostname}
                    onChange={(e) => {
                      formik.setFieldValue("ForceHTTPSCertificateRenewal", true);
                    }}
                    name="UseWildcardCertificate"
                    formik={formik}
                  />

                  {formik.values.UseWildcardCertificate && (
                    <CosmosInputText
                      name="OverrideWildcardDomains"
                      onChange={(e) => {
                        formik.setFieldValue("ForceHTTPSCertificateRenewal", true);
                      }}
                      label={t('management.configuration.security.encryption.overwriteWildcardInput.overwriteWildcardLabel')}
                      formik={formik}
                      placeholder={"example.com,*.example.com"}
                    />
                  )}


                  {formik.values.HTTPSCertificateMode === "LETSENCRYPT" && (
                      <CosmosInputText
                        name="SSLEmail"
                        onChange={(e) => {
                          formik.setFieldValue("ForceHTTPSCertificateRenewal", true);
                        }}
                        label={t('management.configuration.security.encryption.sslLetsEncryptEmailInput.sslLetsEncryptEmailLabel')}
                        formik={formik}
                      />
                    )
                  }
                  
                  {
                    formik.values.HTTPSCertificateMode === "LETSENCRYPT" && (
                      <DnsChallengeComp 
                        onChange={(e) => {
                          formik.setFieldValue("ForceHTTPSCertificateRenewal", true);
                        }}
                        label={t('management.configuration.security.encryption.sslLetsEncryptDnsSelection.sslLetsEncryptDnsLabel')}
                        name="DNSChallengeProvider"
                        configName="DNSChallengeConfig"
                        formik={formik}
                      />
                    )
                  }

                  <Grid item xs={12}>
                    <h4>{t('management.configuration.security.encryption.authPubKeyTitle')}</h4>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                      <pre className='code'>
                        {config.HTTPConfig.AuthPublicKey}
                      </pre>
                    </Stack>
                  </Grid>

                  <Grid item xs={12}>
                    <h4>{t('management.configuration.security.encryption.rootHttpsPubKeyTitle')}</h4>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                      <pre className='code'>
                        {config.HTTPConfig.TLSCert}
                      </pre>
                    </Stack>
                  </Grid>

                  <Grid item xs={12}>
                    <CosmosCheckbox
                      label={t('management.configuration.security.encryption.sslCertForceRenewCheckbox.sslCertForceRenewLabel')}
                      name="ForceHTTPSCertificateRenewal"
                      formik={formik}
                    />
                  </Grid>

                    
                </Grid>
              </MainCard>

              {isAdmin && <MainCard>
                {formik.errors.submit && (
                  <Grid item xs={12}>
                    <FormHelperText error>{formik.errors.submit}</FormHelperText>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <LoadingButton
                      disableElevation
                      loading={formik.isSubmitting}
                      fullWidth
                      size="large"
                      type="submit"
                      variant="contained"
                      color="primary"
                    >
                      {saveLabel}
                    </LoadingButton>
                </Grid>
              </MainCard>}
            </Stack>
          </form>
        )}
      </Formik>
    </>}
  </div>;
}

export default ConfigManagement;