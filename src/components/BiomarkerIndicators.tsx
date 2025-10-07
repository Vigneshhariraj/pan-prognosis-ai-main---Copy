import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, TestTube, AlertCircle, Brain, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Biomarker {
  name: string;
  value: string;
  unit: string;
  status: "elevated" | "normal" | "low";
  trend: "up" | "down" | "stable";
  referenceRange: string;
}

interface BiomarkerIndicatorsProps {
  biomarkers: Biomarker[];
  patientBiomarkers?: {
    ca199?: string;
    creatinine?: string;
    lyve1?: string;
    reg1a?: string;
    reg1b?: string;
    tff1?: string;
  };
  prediction?: {
    prediction_class: number;
    prediction_label: string;
    confidence: number;
    risk_score: number;
    probabilities: {
      Control: number;
      Benign: number;
      Cancer: number;
    };
  };
  className?: string;
}

const BiomarkerIndicators = ({
  biomarkers,
  patientBiomarkers,
  prediction,
  className = ""
}: BiomarkerIndicatorsProps) => {
  
  const calculateBiomarkerStatus = (name: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    
    switch (name.toLowerCase()) {
      case 'ca 19-9':
        if (numValue > 100) return { status: 'elevated', severity: 'high' };
        if (numValue > 37) return { status: 'elevated', severity: 'moderate' };
        return { status: 'normal', severity: 'normal' };
      
      case 'creatinine':
        if (numValue > 1.5) return { status: 'elevated', severity: 'high' };
        if (numValue > 1.3) return { status: 'elevated', severity: 'moderate' };
        if (numValue < 0.6) return { status: 'low', severity: 'low' };
        return { status: 'normal', severity: 'normal' };
      
      case 'lyve1':
        if (numValue > 15) return { status: 'elevated', severity: 'high' };
        if (numValue > 10) return { status: 'elevated', severity: 'moderate' };
        return { status: 'normal', severity: 'normal' };
      
      case 'reg1a':
        if (numValue > 800) return { status: 'elevated', severity: 'high' };
        if (numValue > 500) return { status: 'elevated', severity: 'moderate' };
        return { status: 'normal', severity: 'normal' };
      
      case 'reg1b':
        if (numValue > 600) return { status: 'elevated', severity: 'high' };
        if (numValue > 400) return { status: 'elevated', severity: 'moderate' };
        return { status: 'normal', severity: 'normal' };
      
      case 'tff1':
        if (numValue > 300) return { status: 'elevated', severity: 'high' };
        if (numValue > 200) return { status: 'elevated', severity: 'moderate' };
        return { status: 'normal', severity: 'normal' };
      
      default:
        return { status: 'normal', severity: 'normal' };
    }
  };

  const displayBiomarkers: Biomarker[] = [
    {
      name: "CA 19-9",
      value: patientBiomarkers?.ca199 || "N/A",
      unit: "U/mL",
      status: "normal" as const,
      trend: "stable" as const,
      referenceRange: "0-37"
    },
    {
      name: "Creatinine",
      value: patientBiomarkers?.creatinine || "N/A",
      unit: "mg/dL",
      status: "normal" as const,
      trend: "stable" as const,
      referenceRange: "0.7-1.3"
    },
    {
      name: "LYVE1",
      value: patientBiomarkers?.lyve1 || "N/A",
      unit: "ng/mL",
      status: "normal" as const,
      trend: "stable" as const,
      referenceRange: "3-12"
    },
    {
      name: "REG1A",
      value: patientBiomarkers?.reg1a || "N/A",
      unit: "ng/mL",
      status: "normal" as const,
      trend: "stable" as const,
      referenceRange: "120-580"
    },
    {
      name: "REG1B",
      value: patientBiomarkers?.reg1b || "N/A",
      unit: "ng/mL",
      status: "normal" as const,
      trend: "stable" as const,
      referenceRange: "85-420"
    },
    {
      name: "TFF1",
      value: patientBiomarkers?.tff1 || "N/A",
      unit: "ng/mL",
      status: "normal" as const,
      trend: "stable" as const,
      referenceRange: "45-220"
    }
  ].map(biomarker => {
    if (biomarker.value !== "N/A") {
      const calculatedStatus = calculateBiomarkerStatus(biomarker.name, biomarker.value);
      return {
        ...biomarker,
        status: calculatedStatus.status as "elevated" | "normal" | "low",
        trend: calculatedStatus.severity === 'high' ? 'up' as const :
               calculatedStatus.severity === 'moderate' ? 'up' as const : 'stable' as const
      };
    }
    return biomarker;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "elevated": return "risk-high";
      case "low": return "risk-moderate";
      case "normal": return "risk-low";
      default: return "risk-low";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4" />;
      case "down": return <TrendingDown className="h-4 w-4" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "elevated": return <AlertCircle className="h-5 w-5 text-destructive" />;
      case "low": return <AlertCircle className="h-5 w-5 text-warning" />;
      default: return <TestTube className="h-5 w-5 text-primary" />;
    }
  };

  const getPredictionColor = (label: string) => {
    switch (label) {
      case "Cancer": return "bg-red-100 dark:bg-red-950 border-red-500";
      case "Benign": return "bg-yellow-100 dark:bg-yellow-950 border-yellow-500";
      case "Control": return "bg-green-100 dark:bg-green-950 border-green-500";
      default: return "bg-gray-100 dark:bg-gray-950 border-gray-500";
    }
  };

  const getPredictionBadgeVariant = (label: string) => {
    switch (label) {
      case "Cancer": return "destructive";
      case "Benign": return "default";
      case "Control": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* AI PREDICTION PANEL - THIS IS NEW! */}
      {prediction && (
        <Card className={`border-2 ${getPredictionColor(prediction.prediction_label)}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              XGBoost AI Prediction Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Prediction Result</p>
                <Badge 
                  variant={getPredictionBadgeVariant(prediction.prediction_label) as any}
                  className="text-lg px-3 py-1"
                >
                  {prediction.prediction_label}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Risk Score</p>
                <p className="text-3xl font-bold">{prediction.risk_score}<span className="text-lg text-muted-foreground">/100</span></p>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Confidence Level</span>
                <span className="text-sm font-bold">{(prediction.confidence * 100).toFixed(1)}%</span>
              </div>
              <Progress value={prediction.confidence * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Class Probabilities</p>
              
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Control (Normal)</span>
                    <span className="font-medium">{(prediction.probabilities.Control * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={prediction.probabilities.Control * 100} className="h-1.5" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Benign</span>
                    <span className="font-medium">{(prediction.probabilities.Benign * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={prediction.probabilities.Benign * 100} className="h-1.5" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Cancer</span>
                    <span className="font-medium">{(prediction.probabilities.Cancer * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={prediction.probabilities.Cancer * 100} className="h-1.5" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Analyzed using XGBoost Clinical Biomarker Model
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* BIOMARKER VALUES */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Biomarker Analysis
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Laboratory results and clinical biomarker levels
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {displayBiomarkers.map((biomarker, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border bg-card">
                <div className="mt-0.5">{getStatusIcon(biomarker.status)}</div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{biomarker.name}</p>
                    <Badge className={getStatusBadge(biomarker.status)}>
                      {biomarker.status.charAt(0).toUpperCase() + biomarker.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Reference: {biomarker.referenceRange} {biomarker.unit}
                  </p>
                  
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold">{biomarker.value}</span>
                      <span className="text-sm text-muted-foreground">{biomarker.unit}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      {getTrendIcon(biomarker.trend)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-around pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {displayBiomarkers.filter(b => b.status === 'normal').length}
              </p>
              <p className="text-xs text-muted-foreground">Normal</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {displayBiomarkers.filter(b => b.status === 'low').length}
              </p>
              <p className="text-xs text-muted-foreground">Low</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {displayBiomarkers.filter(b => b.status === 'elevated').length}
              </p>
              <p className="text-xs text-muted-foreground">Elevated</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BiomarkerIndicators;
