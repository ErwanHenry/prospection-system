import { useGetList } from 'react-admin';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  LinearProgress,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import CampaignIcon from '@mui/icons-material/Campaign';
import PeopleIcon from '@mui/icons-material/People';
import EmailIcon from '@mui/icons-material/Email';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const KPICard = ({ title, value, subtitle, icon: Icon, color = 'primary' }) => (
  <Card>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="body2" color="textSecondary">
            {title}
          </Typography>
          <Typography variant="h4" sx={{ mt: 1, color: `${color}.main` }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="textSecondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {Icon && (
          <Icon sx={{ fontSize: 48, color: `${color}.light`, opacity: 0.5 }} />
        )}
      </Box>
    </CardContent>
  </Card>
);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const Dashboard = () => {
  const { data: campaigns = [], isLoading: loadingCampaigns } = useGetList('campaigns', {
    pagination: { page: 1, perPage: 100 },
  });

  const { data: prospects = [], isLoading: loadingProspects } = useGetList('prospects', {
    pagination: { page: 1, perPage: 1000 },
  });

  if (loadingCampaigns || loadingProspects) {
    return <LinearProgress />;
  }

  // Calculate KPIs
  const activeCampaigns = campaigns.filter((c) => c.status === 'ACTIVE').length;
  const totalProspects = prospects.length;
  const contactedProspects = prospects.filter((p) =>
    ['CONTACTED', 'RESPONDED', 'QUALIFIED', 'CONVERTED'].includes(p.status)
  ).length;
  const convertedProspects = prospects.filter((p) => p.status === 'CONVERTED').length;
  const conversionRate =
    contactedProspects > 0
      ? Math.round((convertedProspects / contactedProspects) * 100)
      : 0;

  const totalMessagesSent = campaigns.reduce((sum, c) => sum + (c.messagesSent || 0), 0);
  const totalResponses = campaigns.reduce((sum, c) => sum + (c.responsesReceived || 0), 0);
  const responseRate =
    totalMessagesSent > 0 ? Math.round((totalResponses / totalMessagesSent) * 100) : 0;

  // Status distribution
  const statusData = [
    { name: 'À contacter', value: prospects.filter((p) => p.status === 'TO_CONTACT').length },
    { name: 'Contacté', value: prospects.filter((p) => p.status === 'CONTACTED').length },
    { name: 'A répondu', value: prospects.filter((p) => p.status === 'RESPONDED').length },
    { name: 'Qualifié', value: prospects.filter((p) => p.status === 'QUALIFIED').length },
    { name: 'Converti', value: prospects.filter((p) => p.status === 'CONVERTED').length },
    { name: 'Rejeté', value: prospects.filter((p) => p.status === 'REJECTED').length },
  ].filter((d) => d.value > 0);

  // Campaign performance
  const campaignPerformance = campaigns
    .filter((c) => c.messagesSent > 0)
    .sort((a, b) => b.responsesReceived - a.responsesReceived)
    .slice(0, 5)
    .map((c) => ({
      name: c.name.substring(0, 20),
      envoyés: c.messagesSent,
      réponses: c.responsesReceived,
      taux: c.messagesSent > 0 ? Math.round((c.responsesReceived / c.messagesSent) * 100) : 0,
    }));

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Tableau de bord Prospection
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Campagnes actives"
            value={activeCampaigns}
            subtitle={`${campaigns.length} au total`}
            icon={CampaignIcon}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Prospects totaux"
            value={totalProspects}
            subtitle={`${contactedProspects} contactés`}
            icon={PeopleIcon}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Messages envoyés"
            value={totalMessagesSent}
            subtitle={`${responseRate}% taux de réponse`}
            icon={EmailIcon}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Taux de conversion"
            value={`${conversionRate}%`}
            subtitle={`${convertedProspects} convertis`}
            icon={TrendingUpIcon}
            color="success"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Répartition des prospects par statut
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top 5 campagnes (par réponses)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={campaignPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="envoyés" fill="#8884d8" />
                  <Bar dataKey="réponses" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Évolution des taux de réponse par campagne
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={campaignPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="taux" stroke="#ff7300" name="Taux de réponse %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
