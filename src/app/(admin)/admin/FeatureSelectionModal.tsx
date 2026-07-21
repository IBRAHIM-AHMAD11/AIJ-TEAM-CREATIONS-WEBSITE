"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Choicebox, 
  ChoiceboxItem, 
  ChoiceboxItemTitle 
} from "@/components/ui/choicebox";

// --- Libraries kept as provided ---
const COLOR_LIBRARY = [
  { name: "Onyx Black", hex: "#111827" },
  { name: "Charcoal Slate", hex: "#374151" },
  { name: "Graphite Dark", hex: "#1f2937" },
  { name: "Coal Black", hex: "#030712" },
  { name: "Ash Gray", hex: "#9ca3af" },
  { name: "Silver Metallic", hex: "#e5e7eb" },
  { name: "Platinum Ice", hex: "#f3f4f6" },
];

const SIZE_LIBRARY = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];

const MATERIAL_LIBRARY = [
  "100% Cotton",
  "Premium Leather",
  "Raw Denim",
  "Merino Wool",
  "Pure Silk",
  "Organic Linen",
  "Polyester Blend",
  "Suede",
];

// --- Updated Interface ---
interface FeatureSelectionModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  onSave: (data: { 
    type: "color" | "size" | "material" | "custom"; 
    label: string; 
    value: string 
  }) => void;
}

export function FeatureSelectionModal({ isOpen, onClose, onSave }: FeatureSelectionModalProps) {
  const [activeTab, setActiveTab] = useState<"color" | "size" | "material" | "custom">("color");
  const [colorSearch, setColorSearch] = useState("");

  const [selectedColorHex, setSelectedColorHex] = useState(COLOR_LIBRARY[0].hex);
  const [selectedColorName, setSelectedColorName] = useState(COLOR_LIBRARY[0].name);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedMaterial, setSelectedMaterial] = useState("100% Cotton");

  const [customName, setCustomName] = useState("");
  const [customColor, setCustomColor] = useState("#94a3b8");

  useEffect(() => {
    if (isOpen) {
      setColorSearch("");
      setSelectedColorHex(COLOR_LIBRARY[0].hex);
      setSelectedColorName(COLOR_LIBRARY[0].name);
    }
  }, [isOpen]);

  const filteredColors = useMemo(() => {
    if (!colorSearch.trim()) return COLOR_LIBRARY;
    return COLOR_LIBRARY.filter((col) =>
      col.name.toLowerCase().includes(colorSearch.toLowerCase()) ||
      col.hex.toLowerCase().includes(colorSearch.toLowerCase())
    );
  }, [colorSearch]);

  const handleColorSelection = (hex: string) => {
    setSelectedColorHex(hex);
    const matched = COLOR_LIBRARY.find((c) => c.hex === hex);
    if (matched) setSelectedColorName(matched.name);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === "color") {
      onSave({ type: "color", label: selectedColorName, value: selectedColorHex });
    } else if (activeTab === "size") {
      onSave({ type: "size", label: "Size", value: selectedSize });
    } else if (activeTab === "material") {
      onSave({ type: "material", label: "Material", value: selectedMaterial });
    } else if (activeTab === "custom") {
      onSave({ type: "custom", label: customName || "Custom Tag", value: customColor });
    }

    setCustomName("");
    onClose(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl border border-gray-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900">Add Product Feature</h3>
          <p className="text-xs text-gray-500">Select the specific attribute to add to your product data.</p>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-gray-100 rounded-lg mb-4">
          {(["color", "size", "material", "custom"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`py-1.5 text-xs font-semibold rounded-md capitalize transition-all ${
                activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-950"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Dynamic Forms */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-[300px] max-h-[450px]">
          
          {/* TAB 1: COLOR */}
          {activeTab === "color" && (
            <div className="space-y-3">
              <input
                type="text"
                value={colorSearch}
                onChange={(e) => setColorSearch(e.target.value)}
                placeholder="Search colors..."
                className="w-full text-sm bg-gray-50 border rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <Choicebox value={selectedColorHex} onValueChange={handleColorSelection} className="grid grid-cols-2 gap-2">
                {filteredColors.map((col) => (
                  <ChoiceboxItem key={col.hex} value={col.hex} className="p-2.5">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: col.hex }} />
                      <ChoiceboxItemTitle className="font-semibold text-gray-800">{col.name}</ChoiceboxItemTitle>
                    </div>
                  </ChoiceboxItem>
                ))}
              </Choicebox>
            </div>
          )}

          {/* TAB 2: SIZE */}
          {activeTab === "size" && (
            <div className="space-y-3">
              <Choicebox value={selectedSize} onValueChange={setSelectedSize} className="grid grid-cols-3 gap-2">
                {SIZE_LIBRARY.map((sz) => (
                  <ChoiceboxItem key={sz} value={sz} className="py-3 flex justify-center">
                    <ChoiceboxItemTitle className="font-bold text-sm">{sz}</ChoiceboxItemTitle>
                  </ChoiceboxItem>
                ))}
              </Choicebox>
            </div>
          )}

          {/* TAB 3: MATERIALS */}
          {activeTab === "material" && (
            <div className="space-y-3">
              <Choicebox value={selectedMaterial} onValueChange={setSelectedMaterial} className="grid grid-cols-2 gap-2">
                {MATERIAL_LIBRARY.map((mat) => (
                  <ChoiceboxItem key={mat} value={mat} className="py-3 px-3">
                    <ChoiceboxItemTitle className="text-xs font-semibold">{mat}</ChoiceboxItemTitle>
                  </ChoiceboxItem>
                ))}
              </Choicebox>
            </div>
          )}

          {/* TAB 4: CUSTOM */}
          {activeTab === "custom" && (
            <div className="space-y-4">
              <input
                type="text"
                required
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Feature label (e.g. Fit Type)"
                className="w-full text-sm bg-white border rounded-md px-3 py-2 text-gray-800"
              />
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-full h-10 cursor-pointer"
              />
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-2 text-sm pt-4 border-t mt-4">
          <button type="button" onClick={() => onClose(false)} className="px-4 py-2 border rounded-md text-gray-600">Cancel</button>
          <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-md hover:bg-black">
            Add Feature
          </button>
        </div>
      </div>
    </div>
  );
}