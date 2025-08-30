import { ItineraryItem, Vineyard, Restaurant } from './types';

// Check if user has PDF export access (Pro tier only)
export const canExportPDF = (userPlan: string = 'free'): boolean => {
  return userPlan === 'pro';
};

// Show upgrade message for non-Pro users
export const getUpgradeMessage = (): string => {
  return 'PDF export is available for Pro subscribers only. Upgrade to unlock this feature and get unlimited access to all premium features.';
};

export const generateItineraryPDF = (items: ItineraryItem[], userPlan: string = 'free') => {
  // Check if user has access to PDF export
  if (!canExportPDF(userPlan)) {
    throw new Error(getUpgradeMessage());
  }
  // Sort items by time
  const sortedItems = [...items].sort((a, b) => a.time.localeCompare(b.time));
  
  // Create PDF content as HTML that can be printed
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Vineyard Tour Itinerary</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          color: #333;
          line-height: 1.6;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #7c3aed;
          padding-bottom: 20px;
        }
        .header h1 {
          color: #7c3aed;
          margin-bottom: 10px;
        }
        .header p {
          color: #666;
          margin: 0;
        }
        .itinerary-item {
          margin-bottom: 25px;
          padding: 20px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background-color: #f9fafb;
        }
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }
        .item-title {
          font-size: 18px;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 5px;
        }
        .item-type {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .vineyard {
          background-color: #ede9fe;
          color: #7c3aed;
        }
        .restaurant {
          background-color: #fed7aa;
          color: #ea580c;
        }
        .item-time {
          font-size: 16px;
          font-weight: bold;
          color: #7c3aed;
        }
        .item-details {
          color: #666;
          margin-bottom: 10px;
        }
        .item-location {
          display: flex;
          align-items: center;
          color: #666;
          margin-bottom: 5px;
        }
        .item-rating {
          display: flex;
          align-items: center;
          color: #666;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
        @media print {
          body { margin: 0; padding: 15px; }
          .itinerary-item { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🍇 Your Champagne Day</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
      </div>
      
      ${sortedItems.map((item, index) => {
        const data = item.data as Vineyard | Restaurant;
        const isVineyard = item.type === 'vineyard';
        
        return `
          <div class="itinerary-item">
            <div class="item-header">
              <div>
                <div class="item-title">${data.name}</div>
                <span class="item-type ${item.type}">${isVineyard ? '🍇 Vineyard' : '🍽️ Restaurant'}</span>
              </div>
              <div class="item-time">${item.time}${item.duration ? ` | ${item.duration}` : ''}</div>
            </div>
            
            <div class="item-location">
              📍 ${data.location}
            </div>
            
            <div class="item-rating">
              ⭐ ${data.rating} (${data.reviewCount.toLocaleString()} reviews)
            </div>
            
            ${isVineyard ? `
              <div class="item-details">
                Price: €${(data as Vineyard).pricePerPerson} per person
              </div>
            ` : `
              <div class="item-details">
                Cuisine: ${(data as Restaurant).cuisine} | ${(data as Restaurant).priceRange}
                ${(data as Restaurant).phone ? `<br>Phone: ${(data as Restaurant).phone}` : ''}
              </div>
            `}
          </div>
        `;
      }).join('')}
      
      <div class="footer">
        <p>Created with Vineyard Tour Planner</p>
        <p>25 years of wine expertise at your service</p>
      </div>
    </body>
    </html>
  `;

  // Create a blob and download it
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  // Create a temporary link and click it to download
  const link = document.createElement('a');
  link.href = url;
  link.download = `vineyard-tour-${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
  
  // Also open in new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Auto-print after a short delay
    setTimeout(() => {
      printWindow.print();
    }, 1000);
  }
};
