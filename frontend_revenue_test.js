#!/usr/bin/env node
/**
 * Frontend Revenue Calculation Testing for Lucky Shot Pool Hall Management System
 * Tests localStorage-based functionality and revenue calculations
 */

const fs = require('fs');
const path = require('path');

// Mock localStorage for Node.js environment
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  
  getItem(key) {
    return this.store[key] || null;
  }
  
  setItem(key, value) {
    this.store[key] = value;
  }
  
  removeItem(key) {
    delete this.store[key];
  }
  
  clear() {
    this.store = {};
  }
}

// Set up global localStorage mock
global.localStorage = new MockLocalStorage();

// Mock console methods to capture logs
const consoleLogs = [];
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

console.log = (...args) => {
  consoleLogs.push({ type: 'log', args });
  originalConsoleLog(...args);
};

console.error = (...args) => {
  consoleLogs.push({ type: 'error', args });
  originalConsoleError(...args);
};

// Load and evaluate the mock.js file
const mockJsPath = path.join(__dirname, 'frontend/src/mock.js');
let mockCode = fs.readFileSync(mockJsPath, 'utf8');

// Replace ES6 export syntax with CommonJS for Node.js
mockCode = mockCode.replace(/export const/g, 'const');
mockCode = mockCode.replace(/export \{[^}]+\}/g, '');

// Add exports at the end
mockCode += `
module.exports = {
  mockState,
  mockAPI,
  formatTime,
  calculateElapsedTime
};
`;

// Evaluate the mock code
eval(mockCode);

// Get the exported functions
const { mockState, mockAPI, formatTime, calculateElapsedTime } = module.exports;

// Test Results
const testResults = [];

function runTest(testName, testFn) {
  try {
    const result = testFn();
    testResults.push({ name: testName, passed: result, error: null });
    console.log(`✅ ${testName}: PASSED`);
    return result;
  } catch (error) {
    testResults.push({ name: testName, passed: false, error: error.message });
    console.log(`❌ ${testName}: FAILED - ${error.message}`);
    return false;
  }
}

function testMiscellaneousPurchaseFeature() {
  console.log("\n🔍 Testing Miscellaneous Purchase Feature...");
  
  // Clear localStorage first
  localStorage.clear();
  
  // Reset mock state
  mockState.revenue = { current: 0, daily: 0 };
  mockState.dailyAnalytics = {
    totalPlayers: 0,
    adults: 0,
    children: 0,
    members: 0,
    totalTax: 0,
    totalRevenue: 0,
    totalDiscount: 0,
    timeValue: 0,
    extraValue: 0,
    extraItems: []
  };
  
  const initialDaily = mockState.revenue.daily;
  const initialRevenue = mockState.dailyAnalytics.totalRevenue;
  
  // Test adding miscellaneous purchase
  const purchaseData = {
    description: "Equipment Rental",
    amount: 25.00
  };
  
  const result = mockAPI.addMiscellaneousPurchase(purchaseData);
  
  // Verify purchase was added correctly
  if (!result || result.description !== purchaseData.description || result.amount !== purchaseData.amount) {
    throw new Error("Purchase data not returned correctly");
  }
  
  // Verify daily total was updated
  if (mockState.revenue.daily !== initialDaily + purchaseData.amount) {
    throw new Error(`Daily total not updated correctly. Expected: ${initialDaily + purchaseData.amount}, Got: ${mockState.revenue.daily}`);
  }
  
  // Verify analytics were updated
  if (mockState.dailyAnalytics.totalRevenue !== initialRevenue + purchaseData.amount) {
    throw new Error(`Analytics total revenue not updated correctly. Expected: ${initialRevenue + purchaseData.amount}, Got: ${mockState.dailyAnalytics.totalRevenue}`);
  }
  
  // Verify extra items tracking
  if (mockState.dailyAnalytics.extraItems.length !== 1) {
    throw new Error(`Extra items not tracked correctly. Expected: 1, Got: ${mockState.dailyAnalytics.extraItems.length}`);
  }
  
  const extraItem = mockState.dailyAnalytics.extraItems[0];
  if (extraItem.description !== purchaseData.description || 
      extraItem.amount !== purchaseData.amount || 
      extraItem.type !== 'miscellaneous') {
    throw new Error("Extra item details not correct");
  }
  
  console.log(`   Daily total increased by $${purchaseData.amount}`);
  console.log(`   Analytics updated correctly`);
  console.log(`   Extra items tracked: ${mockState.dailyAnalytics.extraItems.length} items`);
  
  return true;
}

function testRevenueCalculations() {
  console.log("\n🔍 Testing Revenue Calculations...");
  
  // Clear and reset state
  localStorage.clear();
  mockState.revenue = { current: 0, daily: 0 };
  mockState.dailyAnalytics = {
    totalPlayers: 0,
    adults: 0,
    children: 0,
    members: 0,
    totalTax: 0,
    totalRevenue: 0,
    totalDiscount: 0,
    timeValue: 0,
    extraValue: 0,
    extraItems: []
  };
  
  // Add multiple miscellaneous purchases
  mockAPI.addMiscellaneousPurchase({ description: "Snacks", amount: 15.50 });
  mockAPI.addMiscellaneousPurchase({ description: "Drinks", amount: 8.75 });
  mockAPI.addMiscellaneousPurchase({ description: "Equipment", amount: 30.00 });
  
  const expectedTotal = 15.50 + 8.75 + 30.00;
  
  // Verify cumulative calculations
  if (mockState.revenue.daily !== expectedTotal) {
    throw new Error(`Cumulative daily total incorrect. Expected: ${expectedTotal}, Got: ${mockState.revenue.daily}`);
  }
  
  if (mockState.dailyAnalytics.totalRevenue !== expectedTotal) {
    throw new Error(`Cumulative analytics revenue incorrect. Expected: ${expectedTotal}, Got: ${mockState.dailyAnalytics.totalRevenue}`);
  }
  
  if (mockState.dailyAnalytics.extraValue !== expectedTotal) {
    throw new Error(`Extra value calculation incorrect. Expected: ${expectedTotal}, Got: ${mockState.dailyAnalytics.extraValue}`);
  }
  
  if (mockState.dailyAnalytics.extraItems.length !== 3) {
    throw new Error(`Extra items count incorrect. Expected: 3, Got: ${mockState.dailyAnalytics.extraItems.length}`);
  }
  
  console.log(`   Multiple purchases total: $${expectedTotal}`);
  console.log(`   All calculations consistent across revenue tracking`);
  
  return true;
}

function testDailyAnalyticsData() {
  console.log("\n🔍 Testing Daily Analytics Data Structure...");
  
  const analytics = mockAPI.getCurrentAnalytics();
  
  // Verify analytics structure
  const requiredFields = [
    'totalPlayers', 'adults', 'children', 'members',
    'totalTax', 'totalRevenue', 'totalDiscount',
    'timeValue', 'extraValue', 'extraItems'
  ];
  
  for (const field of requiredFields) {
    if (!(field in analytics)) {
      throw new Error(`Missing required analytics field: ${field}`);
    }
  }
  
  // Verify extraItems is an array
  if (!Array.isArray(analytics.extraItems)) {
    throw new Error("extraItems should be an array");
  }
  
  // Verify numeric fields are numbers
  const numericFields = ['totalPlayers', 'adults', 'children', 'members', 'totalTax', 'totalRevenue', 'totalDiscount', 'timeValue', 'extraValue'];
  for (const field of numericFields) {
    if (typeof analytics[field] !== 'number') {
      throw new Error(`${field} should be a number, got ${typeof analytics[field]}`);
    }
  }
  
  console.log(`   Analytics structure valid with ${requiredFields.length} required fields`);
  console.log(`   Extra items array contains ${analytics.extraItems.length} items`);
  
  return true;
}

function testResetDailyFunctionality() {
  console.log("\n🔍 Testing Reset Daily Functionality...");
  
  // Ensure we have some data first
  mockAPI.addMiscellaneousPurchase({ description: "Test Item", amount: 50.00 });
  
  const beforeReset = {
    daily: mockState.revenue.daily,
    totalRevenue: mockState.dailyAnalytics.totalRevenue,
    extraItems: mockState.dailyAnalytics.extraItems.length
  };
  
  if (beforeReset.daily === 0) {
    throw new Error("No data to reset - test setup failed");
  }
  
  // Perform reset
  const resetAnalytics = mockAPI.resetDailyTotal();
  
  // Verify reset worked
  if (mockState.revenue.daily !== 0) {
    throw new Error(`Daily revenue not reset. Expected: 0, Got: ${mockState.revenue.daily}`);
  }
  
  if (mockState.revenue.current !== 0) {
    throw new Error(`Current revenue not reset. Expected: 0, Got: ${mockState.revenue.current}`);
  }
  
  if (mockState.dailyAnalytics.totalRevenue !== 0) {
    throw new Error(`Analytics total revenue not reset. Expected: 0, Got: ${mockState.dailyAnalytics.totalRevenue}`);
  }
  
  if (mockState.dailyAnalytics.extraItems.length !== 0) {
    throw new Error(`Extra items not reset. Expected: 0, Got: ${mockState.dailyAnalytics.extraItems.length}`);
  }
  
  // Verify reset analytics were returned
  if (!resetAnalytics || typeof resetAnalytics !== 'object') {
    throw new Error("Reset should return previous analytics data");
  }
  
  console.log(`   Reset cleared daily total from $${beforeReset.daily} to $0`);
  console.log(`   Reset cleared ${beforeReset.extraItems} extra items`);
  console.log(`   Previous analytics data returned for potential PDF generation`);
  
  return true;
}

function testDataPersistence() {
  console.log("\n🔍 Testing Data Persistence (localStorage)...");
  
  // Clear localStorage
  localStorage.clear();
  
  // Add some data
  mockAPI.addMiscellaneousPurchase({ description: "Persistence Test", amount: 100.00 });
  
  // Verify data was saved to localStorage
  const storedRevenue = localStorage.getItem('poolhall_revenue');
  const storedAnalytics = localStorage.getItem('poolhall_daily_analytics');
  
  if (!storedRevenue) {
    throw new Error("Revenue data not persisted to localStorage");
  }
  
  if (!storedAnalytics) {
    throw new Error("Analytics data not persisted to localStorage");
  }
  
  // Parse and verify stored data
  const parsedRevenue = JSON.parse(storedRevenue);
  const parsedAnalytics = JSON.parse(storedAnalytics);
  
  if (parsedRevenue.daily !== 100.00) {
    throw new Error(`Persisted revenue incorrect. Expected: 100, Got: ${parsedRevenue.daily}`);
  }
  
  if (parsedAnalytics.totalRevenue !== 100.00) {
    throw new Error(`Persisted analytics incorrect. Expected: 100, Got: ${parsedAnalytics.totalRevenue}`);
  }
  
  console.log(`   Data correctly persisted to localStorage`);
  console.log(`   Revenue: $${parsedRevenue.daily}, Analytics: $${parsedAnalytics.totalRevenue}`);
  
  return true;
}

function testStatsCalculation() {
  console.log("\n🔍 Testing Stats Calculation...");
  
  // Reset state
  localStorage.clear();
  mockState.revenue = { current: 0, daily: 0 };
  mockState.tables = [
    { id: 1, name: 'Table 1', players: [], tableTimerHours: 0 },
    { id: 2, name: 'Table 2', players: [], tableTimerHours: 0 }
  ];
  
  // Add miscellaneous purchase
  mockAPI.addMiscellaneousPurchase({ description: "Test Purchase", amount: 75.00 });
  
  // Get stats
  const stats = mockAPI.getStats();
  
  // Verify stats structure
  const requiredStatsFields = ['activeTables', 'totalTables', 'currentRevenue', 'dailyTotal'];
  for (const field of requiredStatsFields) {
    if (!(field in stats)) {
      throw new Error(`Missing required stats field: ${field}`);
    }
  }
  
  // Verify values
  if (stats.activeTables !== 0) {
    throw new Error(`Active tables should be 0, got ${stats.activeTables}`);
  }
  
  if (stats.totalTables !== 2) {
    throw new Error(`Total tables should be 2, got ${stats.totalTables}`);
  }
  
  if (stats.currentRevenue !== 0) {
    throw new Error(`Current revenue should be 0 (no active players), got ${stats.currentRevenue}`);
  }
  
  if (stats.dailyTotal !== 75.00) {
    throw new Error(`Daily total should be 75.00, got ${stats.dailyTotal}`);
  }
  
  console.log(`   Stats calculation working correctly`);
  console.log(`   Daily total: $${stats.dailyTotal}, Current revenue: $${stats.currentRevenue}`);
  
  return true;
}

function runAllTests() {
  console.log("=" * 60);
  console.log("🚀 LUCKY SHOT POOL HALL - REVENUE CALCULATION TESTING");
  console.log("=" * 60);
  
  // Run all tests
  runTest("Miscellaneous Purchase Feature", testMiscellaneousPurchaseFeature);
  runTest("Revenue Calculations", testRevenueCalculations);
  runTest("Daily Analytics Data Structure", testDailyAnalyticsData);
  runTest("Reset Daily Functionality", testResetDailyFunctionality);
  runTest("Data Persistence (localStorage)", testDataPersistence);
  runTest("Stats Calculation", testStatsCalculation);
  
  // Summary
  console.log("\n" + "=" * 60);
  console.log("📊 REVENUE TESTING SUMMARY");
  console.log("=" * 60);
  
  const passed = testResults.filter(t => t.passed).length;
  const total = testResults.length;
  
  testResults.forEach(test => {
    const status = test.passed ? "✅ PASS" : "❌ FAIL";
    console.log(`${test.name.padEnd(35)} ${status}`);
    if (!test.passed && test.error) {
      console.log(`   Error: ${test.error}`);
    }
  });
  
  console.log(`\nResults: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log("🎉 All revenue calculation tests passed!");
    return true;
  } else {
    console.log("⚠️  Some revenue calculation tests failed");
    return false;
  }
}

// Run the tests
const success = runAllTests();
process.exit(success ? 0 : 1);