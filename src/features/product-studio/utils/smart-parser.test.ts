import { SmartParserService } from "./smart-parser";

export function runSmartParserVerification(): boolean {
  const sampleSupplierHtml = `
    <h1>T900 Ultra Smart Watch 2.09" Display - Gold Edition</h1>
    <p>Get authentic smart watch at best price in Bangladesh from NN Enterprise.</p>
    
    <h2>Key Specifications:</h2>
    <ul>
      <li>Display: 2.09" HD AMOLED Touchscreen</li>
      <li>RAM: 128MB</li>
      <li>Battery - 380mAh Lithium Ion</li>
      <li>Waterproof = IP67 Certified</li>
      <li>Connectivity: Bluetooth v5.2 / NFC</li>
      <li>Warranty: 1 Year Official Brand Warranty</li>
    </ul>

    <h2>Top Features:</h2>
    <p>- Real-time Heart Rate & SpO2 blood oxygen tracking</p>
    <p>* Dual Bluetooth calling with noise cancellation speaker</p>
    <p>• Custom watch faces via companion smartphone app</p>
    <p>✓ Wireless fast charging dock included in box</p>
  `;

  const parsed = SmartParserService.parse(sampleSupplierHtml);

  if (parsed.title !== 'T900 Ultra Smart Watch 2.09" Display - Gold Edition') {
    throw new Error(`Title extraction failed: ${parsed.title}`);
  }

  if (parsed.specifications.length < 4) {
    throw new Error(`Specification extraction failed. Found only ${parsed.specifications.length}`);
  }

  if (parsed.features.length < 3) {
    throw new Error(`Feature extraction failed. Found only ${parsed.features.length}`);
  }

  if (parsed.keywords.length === 0) {
    throw new Error("Keyword extraction failed.");
  }

  return true;
}
