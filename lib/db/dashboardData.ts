export interface AnalyticsData {
    feed: {
      total: string;
      details: string[];
    };
    milk: {
      total: string;
      details: string[];
    };
    expense: {
      total: string;
      details: string[];
    };
    profit: {
      total: string;
      details: string[];
      positive: boolean;
    };
    waste: {
      total: string;
      details: string[];
    };
  }
  
  export interface AnalyticsPeriods {
    yesterday: AnalyticsData;
    weekly: AnalyticsData;
    monthly: AnalyticsData;
  }
  
  export const analyticsData: AnalyticsPeriods = {
    yesterday: {
      feed: { 
        total: '850 kg', 
        details: ['Hari Hari: 320kg', 'Bhusa: 280kg', 'Chokar: 180kg', 'Supplement: 70kg'] 
      },
      milk: { 
        total: '148 L', 
        details: ['Morning: 86L', 'Evening: 62L', 'Rate: ₹40/L', '↑ 12% vs previous'] 
      },
      expense: { 
        total: '₹3,240', 
        details: ['Feed: ₹1,850', 'Medicine: ₹680', 'Labor: ₹500', 'Other: ₹210'] 
      },
      profit: { 
        total: '+₹2,680', 
        details: ['Revenue: ₹5,920', 'Expenses: ₹3,240', 'Margin: 45.3%', '↑ Profitable'], 
        positive: true 
      },
      waste: { 
        total: '145 kg', 
        details: ['Value: ₹725', 'Rate: ₹5/kg', 'Status: Ready', 'Available'] 
      }
    },
    weekly: {
      feed: { 
        total: '5,940 kg', 
        details: ['Hari Hari: 2,240kg', 'Bhusa: 1,960kg', 'Chokar: 1,260kg', 'Supplement: 480kg'] 
      },
      milk: { 
        total: '1,036 L', 
        details: ['Morning: 602L', 'Evening: 434L', 'Rate: ₹40/L', '↑ 8% vs last week'] 
      },
      expense: { 
        total: '₹22,680', 
        details: ['Feed: ₹12,950', 'Medicine: ₹4,760', 'Labor: ₹3,500', 'Other: ₹1,470'] 
      },
      profit: { 
        total: '+₹18,760', 
        details: ['Revenue: ₹41,440', 'Expenses: ₹22,680', 'Margin: 45.3%', '↑ Profitable'], 
        positive: true 
      },
      waste: { 
        total: '1,015 kg', 
        details: ['Value: ₹5,075', 'Rate: ₹5/kg', 'Status: Ready', 'Available'] 
      }
    },
    monthly: {
      feed: { 
        total: '25,460 kg', 
        details: ['Hari Hari: 9,600kg', 'Bhusa: 8,400kg', 'Chokar: 5,400kg', 'Supplement: 2,060kg'] 
      },
      milk: { 
        total: '4,440 L', 
        details: ['Morning: 2,580L', 'Evening: 1,860L', 'Rate: ₹40/L', '↑ 18% vs last month'] 
      },
      expense: { 
        total: '₹97,200', 
        details: ['Feed: ₹55,500', 'Medicine: ₹20,400', 'Labor: ₹15,000', 'Other: ₹6,300'] 
      },
      profit: { 
        total: '+₹80,400', 
        details: ['Revenue: ₹177,600', 'Expenses: ₹97,200', 'Margin: 45.3%', '↑ Profitable'], 
        positive: true 
      },
      waste: { 
        total: '4,350 kg', 
        details: ['Value: ₹21,750', 'Rate: ₹5/kg', 'Status: Ready', 'Available'] 
      }
    }
  };
  
  export const alertsData = [
    {
      type: 'critical' as const,
      badge: '🚨 CRITICAL',
      message: 'Medicine Due: Cattle C001 (Bessie) - Deworming overdue by 3 days'
    },
    {
      type: 'critical' as const,
      badge: '📋 MISSING',
      message: 'Feed data not recorded for Nov 21, 2025'
    },
    {
      type: 'warning' as const,
      badge: '📦 LOW STOCK',
      message: 'Bhusa: 120kg remaining - Restock within 2 days'
    },
    {
      type: 'info' as const,
      badge: 'ℹ️ INFO',
      message: 'Milestone: 4,000L milk production this month!'
    }
  ];
  
  