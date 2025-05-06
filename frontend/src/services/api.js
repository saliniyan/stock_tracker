export const placeOrder = async (order, stockEntries) => {
    const response = await fetch('http://localhost:5000/api/orders/placeOrder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });
    
    return response.json();
  };
  