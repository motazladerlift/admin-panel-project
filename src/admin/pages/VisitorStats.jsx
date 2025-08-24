import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Table,
  Badge,
  Spinner,
  Alert,
  Button,
  ProgressBar,
  ButtonGroup
} from 'react-bootstrap';
import { 
  Users, 
  Eye, 
  TrendingUp, 
  Calendar,
  BarChart3,
  Globe,
  Activity,
  ArrowUp,
  ArrowDown,
  Minus,
  List,
  BarChart,
  PieChart,
  Grid
} from 'lucide-react';

const VisitorStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageViewMode, setPageViewMode] = useState('list'); // 'list', 'bars', 'cards', 'chart'

  const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  const adminSecret = import.meta.env.VITE_ADMIN_SECRET;

  useEffect(() => {
    fetchVisitorStats();
  }, []);

  const fetchVisitorStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBase}/visitor-stats`, {
        headers: {
          'X-Admin-Secret': adminSecret || ''
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (current, previous) => {
    if (current > previous) return <ArrowUp size={16} className="text-success" />;
    if (current < previous) return <ArrowDown size={16} className="text-danger" />;
    return <Minus size={16} className="text-muted" />;
  };

  const getTrendText = (current, previous) => {
    if (current > previous) return `+${current - previous} deze periode`;
    if (current < previous) return `${previous - current} minder deze periode`;
    return 'Geen verandering';
  };

  const formatPageName = (page) => {
    const pageNames = {
      '/': 'Homepage',
      '/ladder-lift': 'Ladderlift Diensten',
      '/verhuizen': 'Verhuizen Diensten',
      '/prijzen': 'Prijzen & Tarieven',
      '/contact': 'Contact',
      '/faq': 'Veelgestelde Vragen'
    };
    return pageNames[page] || page;
  };

  const renderPageStatsList = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
      {stats?.visits_by_page?.map((page, index) => (
        <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-2 sm:p-3 lg:p-4 border-l-4 border-orange-500 hover:from-gray-100 hover:to-gray-200 transition-all duration-300 hover:translate-x-1 hover:shadow-md">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2 sm:mb-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-orange-500 to-orange-400 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                <BarChart3 size={10} className="sm:w-3 sm:h-3" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-gray-800 text-xs sm:text-sm lg:text-base truncate">
                  {formatPageName(page.page)}
                </div>
                <div className="text-xs text-gray-600">
                  {Math.round((page.count / stats.visits_by_page.reduce((sum, p) => sum + p.count, 0)) * 100)}% van totaal
                </div>
              </div>
            </div>
            <div className="text-right w-full sm:w-auto">
              <Badge bg="primary" className="text-xs sm:text-sm lg:text-base px-1 sm:px-2 lg:px-3 py-0.5 sm:py-1 rounded-lg font-bold">
                {page.count}
              </Badge>
            </div>
          </div>
          <div className="mt-1 sm:mt-2">
            <ProgressBar 
              now={(page.count / Math.max(...stats.visits_by_page.map(p => p.count))) * 100}
              variant={index % 4 === 0 ? 'primary' : index % 4 === 1 ? 'success' : index % 4 === 2 ? 'warning' : 'info'}
              className="h-1 sm:h-2 rounded-lg"
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderPageStatsBars = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
      {stats?.visits_by_page?.map((page, index) => (
        <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-2 sm:p-3 lg:p-4 border-l-4 border-orange-500 hover:from-gray-100 hover:to-gray-200 transition-all duration-300 hover:translate-x-1 hover:shadow-md">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2 sm:mb-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-orange-500 to-orange-400 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                <BarChart3 size={10} className="sm:w-3 sm:h-3" />
              </div>
              <span className="font-semibold text-gray-800 text-xs sm:text-sm lg:text-base truncate">{formatPageName(page.page)}</span>
            </div>
            <div className="text-right w-full sm:w-auto">
              <div className="font-bold text-orange-500 text-sm sm:text-lg lg:text-xl">{page.count}</div>
              <div className="text-xs text-gray-600">
                {Math.round((page.count / stats.visits_by_page.reduce((sum, p) => sum + p.count, 0)) * 100)}%
              </div>
            </div>
          </div>
          <div className="h-2 sm:h-3 bg-gray-200 rounded-lg overflow-hidden">
            <div 
              className="h-full rounded-lg transition-all duration-1000 ease-in-out relative"
              style={{
                width: `${(page.count / Math.max(...stats.visits_by_page.map(p => p.count))) * 100}%`,
                backgroundColor: index % 4 === 0 ? '#ff6b35' : index % 4 === 1 ? '#27ae60' : index % 4 === 2 ? '#f39c12' : '#3498db'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPageStatsCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
      {stats?.visits_by_page?.map((page, index) => (
        <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-2 sm:p-3 lg:p-4 text-center border-2 border-transparent hover:border-orange-500 transition-all duration-300 hover:-translate-y-1 hover:shadow-md relative overflow-hidden min-h-24 sm:min-h-32 lg:min-h-40">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-400"></div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 mb-2 sm:mb-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-orange-500 to-orange-400 rounded-lg flex items-center justify-center text-white shadow-md">
              <BarChart3 size={12} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
            </div>
            <div className="font-semibold text-gray-800 text-xs sm:text-sm lg:text-base truncate">
              {formatPageName(page.page)}
            </div>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-500">{page.count}</div>
            <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">bezoeken</div>
            <div className="text-xs sm:text-sm lg:text-base font-bold text-green-600 bg-green-100 px-1 sm:px-2 lg:px-3 py-0.5 sm:py-1 rounded-full inline-block shadow-sm">
              {Math.round((page.count / stats.visits_by_page.reduce((sum, p) => sum + p.count, 0)) * 100)}%
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPageStatsChart = () => (
    <div className="p-1 sm:p-2 lg:p-3">
      <div className="flex items-end justify-around h-32 sm:h-40 lg:h-48 gap-1 sm:gap-2 lg:gap-3">
        {stats?.visits_by_page?.map((page, index) => {
          const percentage = (page.count / stats.visits_by_page.reduce((sum, p) => sum + p.count, 0)) * 100;
          const colors = ['#ff6b35', '#27ae60', '#f39c12', '#3498db', '#9b59b6', '#e74c3c'];
          const maxHeight = 120; // ارتفاع ثابت للرسم البياني
          const barHeight = Math.max((percentage / 100) * maxHeight, 10); // ارتفاع العمود مع حد أدنى
          
          return (
            <div key={index} className="flex flex-col items-center flex-1 h-full relative">
              {/* العمود */}
              <div 
                className="w-full max-w-8 sm:max-w-12 lg:max-w-16 rounded-t-lg transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-md relative"
                style={{
                  height: `${barHeight}px`,
                  backgroundColor: colors[index % colors.length]
                }}
              >
                {/* القيمة على العمود */}
                <div className="absolute -top-4 sm:-top-6 left-1/2 transform -translate-x-1/2 text-center w-full">
                  <div className="text-xs font-bold text-gray-800 bg-white px-1 py-0.5 rounded shadow-sm">
                    {page.count}
                  </div>
                </div>
              </div>
              
              {/* اسم الصفحة تحت العمود */}
              <div className="mt-1 sm:mt-2 text-center w-full">
                <div className="text-xs font-semibold text-gray-800 mb-0.5 leading-tight truncate">
                  {formatPageName(page.page)}
                </div>
                <div className="text-xs font-medium text-gray-600">
                  {Math.round(percentage)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderPageStats = () => {
    switch (pageViewMode) {
      case 'list':
        return renderPageStatsList();
      case 'bars':
        return renderPageStatsBars();
      case 'cards':
        return renderPageStatsCards();
      case 'chart':
        return renderPageStatsChart();
      default:
        return renderPageStatsList();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-5">
        <Spinner animation="border" variant="primary" />
        <p className="text-lg text-gray-600">Bezoekersstatistieken laden...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="max-w-2xl mx-auto">
        <Alert.Heading>Fout bij het laden van gegevens</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={fetchVisitorStats}>
          Opnieuw proberen
        </Button>
      </Alert>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2 sm:p-3 lg:p-4">
      {/* Header - Compact */}
      <div className="text-center mb-3 sm:mb-4 lg:mb-6 bg-gradient-to-r from-orange-500 to-orange-400 text-white p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 text-white drop-shadow-lg">Bezoekersstatistieken</h1>
        <p className="text-xs sm:text-sm lg:text-base opacity-90">Monitor bezoekersverkeer op de website</p>
      </div>

      {/* Main Content Grid - Optimized for Horizontal Space Usage */}
      <Row className="g-2 sm:g-3 lg:g-4">
        {/* Left Column - Statistics Cards */}
        <Col xs={12} lg={4} xl={3} className="mb-2 sm:mb-3">
          <Row className="g-2 sm:g-3">
            {/* Today Stats */}
            <Col xs={6} lg={12}>
              <Card className="border-0 shadow-md sm:shadow-lg rounded-lg sm:rounded-xl hover:-translate-y-1 transition-all duration-300 h-full overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-400"></div>
                <Card.Body className="p-2 sm:p-3 lg:p-4">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-500 to-orange-400 rounded-lg flex items-center justify-center text-white shadow-md">
                      <Eye size={16} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-0">{stats?.stats?.today || 0}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-wide">Vandaag</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mb-1 sm:mb-2">Laatste 24 uur</div>
                  <div>
                    <ProgressBar 
                      now={(stats?.stats?.today || 0) / Math.max(stats?.stats?.today || 1, 1) * 100} 
                      variant="primary" 
                      className="h-1 rounded-lg"
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Week Stats */}
            <Col xs={6} lg={12}>
              <Card className="border-0 shadow-md sm:shadow-lg rounded-lg sm:rounded-xl hover:-translate-y-1 transition-all duration-300 h-full overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-400"></div>
                <Card.Body className="p-2 sm:p-3 lg:p-4">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500 to-green-400 rounded-lg flex items-center justify-center text-white shadow-md">
                      <Calendar size={16} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-0">{stats?.stats?.week || 0}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-wide">Deze week</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mb-1 sm:mb-2">Laatste 7 dagen</div>
                  <div>
                    <ProgressBar 
                      now={(stats?.stats?.week || 0) / Math.max(stats?.stats?.week || 1, 1) * 100} 
                      variant="success" 
                      className="h-1 rounded-lg"
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Month Stats */}
            <Col xs={6} lg={12}>
              <Card className="border-0 shadow-md sm:shadow-lg rounded-lg sm:rounded-xl hover:-translate-y-1 transition-all duration-300 h-full overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-yellow-400"></div>
                <Card.Body className="p-2 sm:p-3 lg:p-4">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-yellow-500 to-yellow-400 rounded-lg flex items-center justify-center text-white shadow-md">
                      <BarChart3 size={16} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-0">{stats?.stats?.month || 0}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-wide">Deze maand</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mb-1 sm:mb-2">Huidige maand</div>
                  <div>
                    <ProgressBar 
                      now={(stats?.stats?.month || 0) / Math.max(stats?.stats?.month || 1, 1) * 100} 
                      variant="warning" 
                      className="h-1 rounded-lg"
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Year Stats */}
            <Col xs={6} lg={12}>
              <Card className="border-0 shadow-md sm:shadow-lg rounded-lg sm:rounded-xl hover:-translate-y-1 transition-all duration-300 h-full overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-400"></div>
                <Card.Body className="p-2 sm:p-3 lg:p-4">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-blue-400 rounded-lg flex items-center justify-center text-white shadow-md">
                      <TrendingUp size={16} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-0">{stats?.stats?.year || 0}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-wide">Dit jaar</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mb-1 sm:mb-2">Huidig jaar</div>
                  <div>
                    <ProgressBar 
                      now={(stats?.stats?.year || 0) / Math.max(stats?.stats?.year || 1, 1) * 100} 
                      variant="info" 
                      className="h-1 rounded-lg"
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Center Column - Page Statistics */}
        <Col xs={12} lg={5} xl={6} className="mb-2 sm:mb-3">
          <Card className="border-0 shadow-md sm:shadow-lg rounded-lg sm:rounded-xl h-full overflow-hidden">
            <Card.Header className="bg-gradient-to-r from-gray-800 to-gray-700 text-white border-0 rounded-t-lg sm:rounded-t-xl p-2 sm:p-3 lg:p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h5 className="text-sm sm:text-base lg:text-lg font-bold mb-0">Bezoeken per pagina</h5>
                <ButtonGroup size="sm" className="flex-wrap">
                  <Button 
                    variant={pageViewMode === 'list' ? 'primary' : 'outline-primary'}
                    onClick={() => setPageViewMode('list')}
                    title="Lijst weergave"
                    className="rounded-lg mx-0.5 hover:-translate-y-1 transition-all duration-300 text-xs"
                  >
                    <List size={12} className="sm:w-3 sm:h-3" />
                  </Button>
                  <Button 
                    variant={pageViewMode === 'bars' ? 'primary' : 'outline-primary'}
                    onClick={() => setPageViewMode('bars')}
                    title="Balken weergave"
                    className="rounded-lg mx-0.5 hover:-translate-y-1 transition-all duration-300 text-xs"
                  >
                    <BarChart size={12} className="sm:w-3 sm:h-3" />
                  </Button>
                  <Button 
                    variant={pageViewMode === 'cards' ? 'primary' : 'outline-primary'}
                    onClick={() => setPageViewMode('cards')}
                    title="Kaarten weergave"
                    className="rounded-lg mx-0.5 hover:-translate-y-1 transition-all duration-300 text-xs"
                  >
                    <Grid size={12} className="sm:w-3 sm:h-3" />
                  </Button>
                  <Button 
                    variant={pageViewMode === 'chart' ? 'primary' : 'outline-primary'}
                    onClick={() => setPageViewMode('chart')}
                    title="Grafiek weergave"
                    className="rounded-lg mx-0.5 hover:-translate-y-1 transition-all duration-300 text-xs"
                  >
                    <PieChart size={12} className="sm:w-3 sm:h-3" />
                  </Button>
                </ButtonGroup>
              </div>
            </Card.Header>
            <Card.Body className="p-2 sm:p-3 lg:p-4 min-h-40 sm:min-h-60">
              {renderPageStats()}
              {(!stats?.visits_by_page || stats.visits_by_page.length === 0) && (
                <p className="text-gray-500 text-center text-sm">Geen gegevens beschikbaar</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column - General Statistics */}
        <Col xs={12} lg={3} xl={3} className="mb-2 sm:mb-3">
          <Card className="border-0 shadow-md sm:shadow-lg rounded-lg sm:rounded-xl h-full overflow-hidden">
            <Card.Header className="bg-gradient-to-r from-gray-800 to-gray-700 text-white border-0 rounded-t-lg sm:rounded-t-xl p-2 sm:p-3 lg:p-4">
              <h5 className="text-sm sm:text-base lg:text-lg font-bold mb-0">Algemene Statistieken</h5>
            </Card.Header>
            <Card.Body className="p-2 sm:p-3 lg:p-4">
              <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-2 sm:p-3 lg:p-4 border-l-4 border-orange-500 hover:from-gray-100 hover:to-gray-200 transition-all duration-300 hover:translate-x-1 hover:shadow-md">
                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                    <Globe size={14} className="sm:w-4 sm:h-4 text-orange-500" />
                    <span className="font-semibold text-gray-800 text-xs sm:text-sm lg:text-base">Totaal bezoeken</span>
                  </div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-500 mb-1">{stats?.stats?.total || 0}</div>
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 rounded-full transition-all duration-1000"
                      style={{
                        width: `${(stats?.stats?.total || 0) / Math.max(stats?.stats?.total || 1, 1) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-2 sm:p-3 lg:p-4 border-l-4 border-green-500 hover:from-gray-100 hover:to-gray-200 transition-all duration-300 hover:translate-x-1 hover:shadow-md">
                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                    <Users size={14} className="sm:w-4 sm:h-4 text-green-500" />
                    <span className="font-semibold text-gray-800 text-xs sm:text-sm lg:text-base">Unieke bezoekers</span>
                  </div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-500 mb-1">{stats?.stats?.unique_visitors || 0}</div>
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all duration-1000"
                      style={{
                        width: `${(stats?.stats?.unique_visitors || 0) / Math.max(stats?.stats?.unique_visitors || 1, 1) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Detailed Visits Table - Full Width */}
      <Row className="mt-2 sm:mt-3 lg:mt-4">
        <Col xs={12}>
          <Card className="border-0 shadow-md sm:shadow-lg rounded-lg sm:rounded-xl overflow-hidden">
            <Card.Header className="bg-gradient-to-r from-gray-800 to-gray-700 text-white border-0 rounded-t-lg sm:rounded-t-xl p-2 sm:p-3 lg:p-4">
              <h5 className="text-sm sm:text-base lg:text-lg font-bold mb-0">Gedetailleerde bezoeken (laatste 30 dagen)</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="overflow-x-auto">
                <Table striped bordered hover className="mb-0 w-full text-xs sm:text-sm">
                  <thead>
                    <tr>
                      <th className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 font-bold text-center p-1 sm:p-2 lg:p-3 border-b-2 border-gray-300 w-1/4">Datum</th>
                      <th className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 font-bold text-center p-1 sm:p-2 lg:p-3 border-b-2 border-gray-300 w-1/4">Aantal bezoeken</th>
                      <th className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 font-bold text-center p-1 sm:p-2 lg:p-3 border-b-2 border-gray-300 w-1/4">Trend</th>
                      <th className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 font-bold text-center p-1 sm:p-2 lg:p-3 border-b-2 border-gray-300 w-1/4">Visualisatie</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.visits_trend?.map((visit, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="text-center p-1 sm:p-2 lg:p-3 font-medium border-r border-gray-200 text-xs">{visit.date}</td>
                        <td className="text-center p-1 sm:p-2 lg:p-3 border-r border-gray-200">
                          <strong className="text-xs sm:text-sm lg:text-base text-orange-500">{visit.count}</strong>
                        </td>
                        <td className="text-center p-1 sm:p-2 lg:p-3 border-r border-gray-200">
                          <div className="flex items-center justify-center gap-1">
                            {index > 0 && getTrendIcon(visit.count, stats.visits_trend[index - 1].count)}
                            <span className="text-xs font-medium">
                              {index > 0 ? getTrendText(visit.count, stats.visits_trend[index - 1].count) : 'Eerste dag'}
                            </span>
                          </div>
                        </td>
                        <td className="text-center p-1 sm:p-2 lg:p-3">
                          <div className="flex justify-center">
                            <div className="flex gap-0.5 items-center">
                              {[...Array(Math.min(visit.count, 8))].map((_, i) => (
                                <div 
                                  key={i} 
                                  className="w-1 h-1 sm:w-1.5 sm:h-1.5 lg:w-2 lg:h-2 rounded-full transition-all duration-300"
                                  style={{
                                    backgroundColor: visit.count > 5 ? '#ff6b35' : '#27ae60',
                                    opacity: 1 - (i * 0.05)
                                  }}
                                ></div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(!stats?.visits_trend || stats.visits_trend.length === 0) && (
                      <tr>
                        <td colSpan="4" className="text-center text-gray-500 p-3 sm:p-4 lg:p-6 text-sm">
                          Geen gegevens beschikbaar
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default VisitorStats;
