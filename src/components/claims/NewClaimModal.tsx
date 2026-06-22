import React, { useState } from 'react';
import { Search, CheckCircle2 } from 'lucide-react';
import Modal from '../shared/Modal';
import { useApp } from '../../context/AppContext';
import { Claim, ClaimCategory } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const MOCK_POLICIES = [
  { policyNumber: 'POL-AE-2025-99001', holderName: 'James Morrison', vehicle: 'Toyota Land Cruiser 2023', reg: 'Dubai A 77001' },
  { policyNumber: 'POL-AE-2025-99002', holderName: 'Nadia Al Rashidi', vehicle: 'Nissan Altima 2022', reg: 'Abu Dhabi B 44321' },
  { policyNumber: 'POL-AE-2025-99003', holderName: 'Carlos Pereira', vehicle: 'Honda Accord 2024', reg: 'Sharjah C 12345' },
];

type Step = 1 | 2 | 3;

export default function NewClaimModal({ onClose }: { onClose: () => void }) {
  const { updateClaim, currentUser, claims } = useApp();
  const [step, setStep] = useState<Step>(1);
  const [policySearch, setPolicySearch] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState<typeof MOCK_POLICIES[0] | null>(null);
  const [accidentDate, setAccidentDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [thirdParty, setThirdParty] = useState(false);
  const [policeReport, setPoliceReport] = useState('');
  const [category, setCategory] = useState<ClaimCategory | ''>('');
  const [createdClaim, setCreatedClaim] = useState<string | null>(null);

  const { claims: allClaims } = useApp();

  const filteredPolicies = MOCK_POLICIES.filter(p =>
    p.policyNumber.toLowerCase().includes(policySearch.toLowerCase()) ||
    p.holderName.toLowerCase().includes(policySearch.toLowerCase()) ||
    p.reg.toLowerCase().includes(policySearch.toLowerCase())
  );

  const handleCreate = () => {
    if (!selectedPolicy || !accidentDate || !location || !description) return;

    const claimNumber = `CLM-2026-${String(100000 + allClaims.length + 1).slice(-6)}`;
    const id = uuidv4();
    const token = `tok_${id.slice(0, 8)}_secure`;

    const newClaim: Claim = {
      id, claimNumber,
      status: 'NOT_ASSIGNED',
      category: category || undefined,
      policy: {
        policyNumber: selectedPolicy.policyNumber,
        policyHolderName: selectedPolicy.holderName,
        vehicleRegistration: selectedPolicy.reg,
        vehicleMake: selectedPolicy.vehicle.split(' ')[0],
        vehicleModel: selectedPolicy.vehicle.split(' ').slice(1, -1).join(' '),
        vehicleYear: parseInt(selectedPolicy.vehicle.split(' ').pop() ?? '2023'),
        coverageType: 'Comprehensive', deductible: 1000, sumInsured: 80000,
        expiryDate: '2027-12-31', isActive: true,
      },
      accident: {
        dateTime: accidentDate,
        location, description,
        thirdPartyInvolved: thirdParty,
        policeReportNumber: policeReport || undefined,
        injuriesReported: false,
      },
      customerId: id, customerName: selectedPolicy.holderName,
      customerEmail: `customer${allClaims.length + 1}@email.com`,
      customerPhone: '+971501234567',
      customerToken: token,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      assignments: [],
      currentAssignees: [],
      documents: [],
      timeline: [{
        id: uuidv4(), claimId: id,
        event: 'Claim Created',
        description: `Claim initiated by ${currentUser?.name}`,
        actor: currentUser?.name ?? 'Agent',
        actorRole: currentUser?.role ?? 'CALL_CENTER_AGENT',
        timestamp: new Date().toISOString(),
        status: 'NOT_ASSIGNED',
      }],
      inspections: [],
      offers: [],
      queue: 'INCOMING',
      sla: {
        claimId: id, targetHours: 48,
        startedAt: new Date().toISOString(),
        dueAt: new Date(Date.now() + 48 * 3600000).toISOString(),
        isBreached: false, remainingHours: 48,
      },
      liabilityStatus: 'PENDING', fraudStatus: 'CLEAR',
    };

    // We need to add to context — use a workaround via context
    (window as any).__addClaim?.(newClaim);
    setCreatedClaim(claimNumber);
    setStep(3);
  };

  return (
    <Modal title="New Motor Claim" onClose={onClose} size="lg">
      {/* Steps */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 ${step >= s ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step > s ? 'bg-blue-600 text-white' : step === s ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                {step > s ? '✓' : s}
              </div>
              <span className="text-xs font-medium hidden sm:block">
                {s === 1 ? 'Policy Search' : s === 2 ? 'Accident Details' : 'Confirmation'}
              </span>
            </div>
            {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Search Policy</label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                value={policySearch} onChange={e => setPolicySearch(e.target.value)}
                placeholder="Policy number, customer name, or registration..."
                className="flex-1 outline-none text-sm text-gray-700"
              />
            </div>
          </div>

          <div className="space-y-2">
            {filteredPolicies.map(p => (
              <div
                key={p.policyNumber}
                onClick={() => setSelectedPolicy(p)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${selectedPolicy?.policyNumber === p.policyNumber ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-300 bg-white'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{p.holderName}</p>
                    <p className="text-sm text-gray-500">{p.policyNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">{p.vehicle}</p>
                    <p className="text-xs text-gray-400">{p.reg}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button
              disabled={!selectedPolicy}
              onClick={() => setStep(2)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg text-sm">
            <strong>{selectedPolicy?.holderName}</strong> — {selectedPolicy?.vehicle} — {selectedPolicy?.reg}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Accident Date & Time *</label>
              <input type="datetime-local" value={accidentDate} onChange={e => setAccidentDate(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Claim Category</label>
              <select value={category} onChange={e => setCategory(e.target.value as ClaimCategory)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none">
                <option value="">To be determined</option>
                <option value="SIMPLE">Simple</option>
                <option value="CORE">Core</option>
                <option value="COMPLEX">Complex</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Accident Location *</label>
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Sheikh Zayed Road, Dubai" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Accident Description *</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe the accident..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Police Report # (if any)</label>
              <input value={policeReport} onChange={e => setPoliceReport(e.target.value)} placeholder="Optional" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none" />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={thirdParty} onChange={e => setThirdParty(e.target.checked)} className="w-4 h-4 accent-blue-600" />
                Third Party Involved
              </label>
            </div>
          </div>

          <div className="flex justify-between gap-3 pt-2">
            <button onClick={() => setStep(1)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Back</button>
            <button
              disabled={!accidentDate || !location || !description}
              onClick={handleCreate}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40"
            >
              Create Claim
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="text-center py-8">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Claim Created Successfully</h3>
          <p className="text-lg font-semibold text-blue-600 mb-1">{createdClaim}</p>
          <p className="text-sm text-gray-500 mb-6">Status: Not Assigned — Ready for assignment</p>
          <div className="flex gap-3 justify-center">
            <button onClick={onClose} className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Close</button>
            <button onClick={onClose} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">View Claims</button>
          </div>
        </div>
      )}
    </Modal>
  );
}
