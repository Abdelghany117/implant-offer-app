import React, { useState, useEffect } from 'react';

// Main App component for the Dental Implant Offer Calculator
function App() {
  // Master password for accessing cost price editing
  const MASTER_PASSWORD = 'admin'; // Hardcoded password for demonstration

  // State variables
  const [isMasterMode, setIsMasterMode] = useState(false); // Controls visibility of cost fields
  const [passwordInput, setPasswordInput] = useState(''); // Input for master password
  const [exchangeRate, setExchangeRate] = useState(4.2); // Default Euro to SAR exchange rate, updated to 4.2
  const [shippingCustomsPercentage, setShippingCustomsPercentage] = useState(10.0); // Default S&C percentage, updated to 10.0
  const [implantSellingPriceDoctor, setImplantSellingPriceDoctor] = useState(0); // Selling price per implant for doctor

  // New state variables for editable minimum margins
  const [minMargin0_299, setMinMargin0_299] = useState(35); // Default 35% for 0-299 implants
  const [minMargin300_499, setMinMargin300_499] = useState(30); // Default 30% for 300-499 implants
  const [minMargin500Plus, setMinMargin500Plus] = useState(25); // Default 25% for 500+ implants


  // Define the list of implant accessories and courses with their initial properties
  const [items, setItems] = useState([
    { id: 'implantBody', name: 'Implant Body', quantity: 0, exFactoryCostEuro: 51, isSAR: false },
    { id: 'coverScrew', name: 'Cover Screw', quantity: 0, exFactoryCostEuro: 0, isSAR: false },
    { id: 'healingAbutment', name: 'Healing Abutment', quantity: 0, exFactoryCostEuro: 0, isSAR: false },
    { id: 'traditionalImpressionCoping', name: 'Traditional Impression Coping (Open or Closed)', quantity: 0, exFactoryCostEuro: 15, isSAR: false },
    { id: 'digitalScanBody', name: 'Digital Scan Body', quantity: 0, exFactoryCostEuro: 20, isSAR: false },
    { id: 'traditionalAnalog', name: 'Traditional Analog', quantity: 0, exFactoryCostEuro: 10.6, isSAR: false },
    { id: 'digitalAnalog', name: 'Digital Analog', quantity: 0, exFactoryCostEuro: 27, isSAR: false },
    { id: 'nonScallopedStraightAbutment', name: 'Non-scalloped straight abutment', quantity: 0, exFactoryCostEuro: 19.6, isSAR: false },
    { id: 'scallopedStraightAbutment', name: 'Scalloped Straight abutment', quantity: 0, exFactoryCostEuro: 22, isSAR: false },
    { id: 'angulatedAbutment', name: 'Angulated abutment', quantity: 0, exFactoryCostEuro: 25.5, isSAR: false },
    { id: 'tiBase', name: 'Ti-Base', quantity: 0, exFactoryCostEuro: 22.5, isSAR: false },
    { id: 'conicalAbutmentMUA', name: 'Conical abutment with accessories (MUA)', quantity: 0, exFactoryCostEuro: 55, isSAR: false },
    { id: 'surgicalKit', name: 'Surgical Kit', quantity: 0, exFactoryCostEuro: 0, isSAR: false },
    { id: 'guidedKit', name: 'Guided Kit', quantity: 0, exFactoryCostEuro: 1550, isSAR: false },
    { id: 'guidedSleeves', name: 'Guided Sleeves', quantity: 0, exFactoryCostEuro: 10.6, isSAR: false },
    { id: 'regionalCourse', name: 'Regional Course', quantity: 0, exFactoryCostEuro: 10000, isSAR: true }, // isSAR: true means cost is directly in SAR
    { id: 'internationalCourse', name: 0, exFactoryCostEuro: 0, isSAR: true }, // isSAR: true
    { id: 'crown', name: 'Crown', quantity: 0, exFactoryCostEuro: 0, isSAR: true }, // isSAR: true
  ]);

  // Function to calculate the landed cost for a single item
  const calculateLandedCost = (item) => {
    if (item.isSAR) {
      // For items already in SAR, exFactoryCostEuro is treated as SAR cost
      return item.exFactoryCostEuro;
    }
    // Calculate cost in SAR from Euro, then add shipping/customs
    const costInSAR = item.exFactoryCostEuro * exchangeRate;
    return costInSAR * (1 + shippingCustomsPercentage / 100);
  };

  // Get the quantity of Implant Body
  const implantBodyQuantity = items.find(item => item.id === 'implantBody')?.quantity || 0;

  // Calculate the total offer based on Implant Selling Price for Doctor and Implant Body quantity
  const totalOffer = implantSellingPriceDoctor * implantBodyQuantity;

  // Calculate total landed cost of all quantities
  const totalLandedCost = items.reduce((sum, item) => {
    return sum + (item.quantity * calculateLandedCost(item));
  }, 0);

  // Determine the minimum accepted margin percentage based on implant body quantity
  const getMinMarginPercentage = (quantity) => {
    if (quantity >= 500) {
      return minMargin500Plus;
    } else if (quantity >= 300) {
      return minMargin300_499;
    } else {
      return minMargin0_299;
    }
  };

  const minMarginPercentage = getMinMarginPercentage(implantBodyQuantity);

  // Calculate required margin threshold based on dynamic margin
  const requiredMarginThreshold = totalLandedCost * (1 + minMarginPercentage / 100);

  // Determine offer status based on total offer vs. required margin
  const offerStatus = totalOffer >= requiredMarginThreshold ? 'Accepted' : 'Not Accepted';

  // Calculate margin percentage (actual margin achieved)
  const marginPercentage = totalLandedCost > 0 ? ((totalOffer - totalLandedCost) / totalLandedCost) * 100 : 0;

  // Calculate total implant quantities at 950 SAR/Implant (if offer is accepted)
  const totalImplantsAt950SAR = offerStatus === 'Accepted' ? (totalOffer / 950) : 0;

  // Calculate free implants (if offer is accepted)
  const freeImplants = offerStatus === 'Accepted' ?
    (implantBodyQuantity - totalImplantsAt950SAR) : 0;

  // Handle quantity changes for an item
  const handleQuantityChange = (id, value) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity: parseFloat(value) || 0 } : item
      )
    );
  };

  // Handle ex-factory cost changes for an item (master mode)
  const handleExFactoryCostChange = (id, value) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, exFactoryCostEuro: parseFloat(value) || 0 } : item
      )
    );
  };

  // Handle master access login
  const handleMasterLogin = () => {
    if (passwordInput === MASTER_PASSWORD) {
      setIsMasterMode(true);
      setPasswordInput(''); // Clear password input on success
    } else {
      alert('Incorrect password. Please try again.'); // Using alert as per instruction for simple message
    }
  };

  // Handle input focus to clear '0'
  const handleFocus = (e) => {
    if (e.target.value === '0' || e.target.value === '0.0') {
      e.target.value = '';
    }
  };

  // Handle input blur to set '0' if empty
  const handleBlur = (e, setter, currentValue) => {
    if (e.target.value === '') {
      setter(0);
    } else {
      setter(parseFloat(e.target.value));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4 font-inter">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl p-8 space-y-8">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">Dental Implant Offer Calculator</h1>

        {/* Master Access Section */}
        <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Master Access</h2>
          {!isMasterMode ? (
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <input
                type="password"
                placeholder="Enter Master Password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
              <button
                onClick={handleMasterLogin}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
              >
                Unlock Master Mode
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <span className="text-green-600 font-semibold text-lg">Master Mode Active!</span>
              <button
                onClick={() => setIsMasterMode(false)}
                className="mt-4 sm:mt-0 px-6 py-3 bg-red-500 text-white font-bold rounded-lg shadow-md hover:bg-red-600 transition duration-300 ease-in-out transform hover:scale-105"
              >
                Exit Master Mode
              </button>
            </div>
          )}
        </div>

        {/* Global Cost Settings (Master Mode Only) */}
        {isMasterMode && (
          <div className="bg-blue-50 p-6 rounded-xl shadow-inner border border-blue-200">
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">Global Cost Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label htmlFor="exchangeRate" className="block text-gray-700 text-sm font-bold mb-2">
                  Exchange Rate (Euro to SAR)
                </label>
                <input
                  id="exchangeRate"
                  type="number"
                  step="0.01"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)}
                  onFocus={handleFocus}
                  onBlur={(e) => handleBlur(e, setExchangeRate, exchangeRate)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="shippingCustoms" className="block text-gray-700 text-sm font-bold mb-2">
                  Shipping, Customs, and Clearance (%)
                </label>
                <input
                  id="shippingCustoms"
                  type="number"
                  step="0.1"
                  value={shippingCustomsPercentage}
                  onChange={(e) => setShippingCustomsPercentage(parseFloat(e.target.value) || 0)}
                  onFocus={handleFocus}
                  onBlur={(e) => handleBlur(e, setShippingCustomsPercentage, shippingCustomsPercentage)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                />
              </div>

              {/* New fields for editable minimum margins */}
              <div>
                <label htmlFor="minMargin0_299" className="block text-gray-700 text-sm font-bold mb-2">
                  Min Margin (0-299 Implants) %
                </label>
                <input
                  id="minMargin0_299"
                  type="number"
                  step="0.1"
                  value={minMargin0_299}
                  onChange={(e) => setMinMargin0_299(parseFloat(e.target.value) || 0)}
                  onFocus={handleFocus}
                  onBlur={(e) => handleBlur(e, setMinMargin0_299, minMargin0_299)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="minMargin300_499" className="block text-gray-700 text-sm font-bold mb-2">
                  Min Margin (300-499 Implants) %
                </label>
                <input
                  id="minMargin300_499"
                  type="number"
                  step="0.1"
                  value={minMargin300_499}
                  onChange={(e) => setMinMargin300_499(parseFloat(e.target.value) || 0)}
                  onFocus={handleFocus}
                  onBlur={(e) => handleBlur(e, setMinMargin300_499, minMargin300_499)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="minMargin500Plus" className="block text-gray-700 text-sm font-bold mb-2">
                  Min Margin (500+ Implants) %
                </label>
                <input
                  id="minMargin500Plus"
                  type="number"
                  step="0.1"
                  value={minMargin500Plus}
                  onChange={(e) => setMinMargin500Plus(parseFloat(e.target.value) || 0)}
                  onFocus={handleFocus}
                  onBlur={(e) => handleBlur(e, setMinMargin500Plus, minMargin500Plus)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Offer Quantities Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Offer Quantities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100">
                <label htmlFor={item.id} className="block text-gray-700 text-sm font-bold mb-2">
                  {item.name} Quantity
                </label>
                <input
                  id={item.id}
                  type="number"
                  min="0"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                  onFocus={handleFocus}
                  onBlur={(e) => handleBlur(e, (val) => handleQuantityChange(item.id, val), item.quantity)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                />
                {isMasterMode && (
                  <div className="mt-4 space-y-2">
                    <label htmlFor={`${item.id}-exFactory`} className="block text-blue-700 text-sm font-bold">
                      Ex-factory costs ({item.isSAR ? 'SAR' : 'Euro'})
                    </label>
                    <input
                      id={`${item.id}-exFactory`}
                      type="number"
                      step="0.01"
                      value={item.exFactoryCostEuro}
                      onChange={(e) => handleExFactoryCostChange(item.id, e.target.value)}
                      onFocus={handleFocus}
                      onBlur={(e) => handleBlur(e, (val) => handleExFactoryCostChange(item.id, val), item.exFactoryCostEuro)}
                      className="w-full p-3 border border-blue-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-blue-100"
                    />
                    <div className="text-sm text-gray-600">
                      Landed Cost (SAR): <span className="font-semibold text-gray-800">{calculateLandedCost(item).toFixed(2)} SAR</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Selling Price and Results Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Offer Details and Results</h2>

          {/* Implant Selling Price for Doctor */}
          <div className="mb-6">
            <label htmlFor="implantSellingPriceDoctor" className="block text-gray-700 text-sm font-bold mb-2">
              Implant Selling Price for Doctor (SAR)
            </label>
            <input
              id="implantSellingPriceDoctor"
              type="number"
              step="0.01"
              value={implantSellingPriceDoctor}
              onChange={(e) => setImplantSellingPriceDoctor(parseFloat(e.target.value) || 0)}
              onFocus={handleFocus}
              onBlur={(e) => handleBlur(e, setImplantSellingPriceDoctor, implantSellingPriceDoctor)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm text-lg font-semibold"
            />
          </div>

          {/* Total Offer */}
          <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <label className="block text-green-800 text-sm font-bold mb-2">
              Total Offer
            </label>
            <p className="text-3xl font-extrabold text-green-900">
              {totalOffer.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} SAR
            </p>
          </div>

          {/* Margin and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <label className="block text-purple-800 text-sm font-bold mb-2">
                Margin %
              </label>
              <p className="text-2xl font-bold text-purple-900">
                {marginPercentage.toFixed(2)}%
              </p>
            </div>
            <div className={`p-4 rounded-lg border ${offerStatus === 'Accepted' ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'}`}>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Offer Status
              </label>
              <p className={`text-2xl font-bold ${offerStatus === 'Accepted' ? 'text-green-700' : 'text-red-700'}`}>
                {offerStatus}
              </p>
            </div>
          </div>

          {/* Additional Fields for Accepted Offers */}
          {offerStatus === 'Accepted' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <label className="block text-yellow-800 text-sm font-bold mb-2">
                  Total Implant quantities in the offer of 950 SAR/Implant
                </label>
                <p className="text-2xl font-bold text-yellow-900">
                  {totalImplantsAt950SAR.toFixed(2)} Implants
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <label className="block text-orange-800 text-sm font-bold mb-2">
                  Free Implant with the offer of 950/Implant
                </label>
                <p className="text-2xl font-bold text-orange-900">
                  {freeImplants.toFixed(2)} Implants
                </p>
              </div>
            </div>
          )}

          {isMasterMode && (
            <div className="mt-8 p-4 bg-gray-100 rounded-lg border border-gray-300">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Master Mode Cost Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Total Landed Cost of all quantities
                  </label>
                  <p className="text-xl font-bold text-gray-900">
                    {totalLandedCost.toFixed(2)} SAR
                  </p>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Minimum Accepted Margin Percentage
                  </label>
                  <p className="text-xl font-bold text-gray-900">
                    {minMarginPercentage}%
                  </p>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Minimum Accepted Offer Value (SAR)
                  </label>
                  <p className="text-xl font-bold text-gray-900">
                    {requiredMarginThreshold.toFixed(2)} SAR
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
