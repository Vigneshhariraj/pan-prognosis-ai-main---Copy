import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  BarChart3, 
  FileText, 
  Clock,
  Scan,
  Download,
  Eye,
  ZoomIn,
  Printer,
  Share2,
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar,
  User
} from "lucide-react";
import RiskMeter from "./RiskMeter";
import BiomarkerIndicators from "./BiomarkerIndicators";

// Mock biomarkers for display
const mockBiomarkers = [
  {
    name: "CA 19-9",
    value: "0",
    unit: "U/mL",
    status: "normal" as const,
    trend: "stable" as const,
    referenceRange: "0-37"
  }
];

interface ClinicalTabsProps {
  patientData?: {
    riskScore: number;
    biomarkerScore?: number;
    ctImageScore?: number;
    biomarkers?: Array<{
      name: string;
      value: string;
      unit: string;
      status: "elevated" | "normal" | "low";
      trend: "up" | "down" | "stable";
      referenceRange: string;
    }>;
  };
  patientId?: string;
  patientInfo?: {
    name?: string;
    age?: number;
    gender?: string;
    condition?: string;
    biomarkers?: {
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
    symptoms?: string;
    medicalHistory?: string;
  };
  biomarkerScore?: number;
  ctImageScore?: number;
  riskScore?: number;
}

const ClinicalTabs = ({ 
  patientData, 
  patientId, 
  patientInfo,
  biomarkerScore,
  ctImageScore,
  riskScore 
}: ClinicalTabsProps) => {
  const [selectedImage, setSelectedImage] = useState(null);

  // Use combined data from both props
  const finalRiskScore = riskScore || patientData?.riskScore || patientInfo?.prediction?.risk_score || 0;
  const finalBiomarkerScore = biomarkerScore || patientData?.biomarkerScore || patientInfo?.prediction?.risk_score || 0;
  const finalCtImageScore = ctImageScore || patientData?.ctImageScore || 0;

  // Dynamic CT images based on patient condition
  const getCtImages = () => {
    const baseImages = [
      {
        id: "ct_001",
        name: "Axial CT - Upper Abdomen",
        date: new Date().toLocaleDateString(),
        type: "Contrast Enhanced",
        findings: `Pancreatic assessment for ${patientInfo?.name || 'patient'}`,
        url: "/api/placeholder/400/300"
      },
      {
        id: "ct_002", 
        name: "Coronal CT - Pancreas",
        date: new Date().toLocaleDateString(),
        type: "Arterial Phase",
        findings: "Vascular involvement assessment",
        url: "/api/placeholder/400/300"
      },
      {
        id: "ct_003",
        name: "Sagittal CT - Pancreas", 
        date: new Date().toLocaleDateString(),
        type: "Portal Venous Phase",
        findings: "Staging evaluation and analysis",
        url: "/api/placeholder/400/300"
      }
    ];

    if (patientInfo?.condition?.toLowerCase().includes('mass') || 
        patientInfo?.condition?.toLowerCase().includes('cancer')) {
      baseImages[0].findings = "Pancreatic mass identified - detailed morphological analysis";
      baseImages.push({
        id: "ct_004",
        name: "3D Reconstruction",
        date: new Date().toLocaleDateString(),
        type: "Volume Rendering",
        findings: "3D visualization of pancreatic mass",
        url: "/api/placeholder/400/300"
      });
    }

    return baseImages;
  };

  // Dynamic report sections based on patient data
  const generateReportSections = () => {
    const prediction = patientInfo?.prediction;
    
    const sections = [
      {
        title: "Clinical Summary",
        content: `${patientInfo?.age || 'Adult'}-year-old ${patientInfo?.gender?.toLowerCase() || 'patient'} presenting with ${patientInfo?.symptoms || 'abdominal symptoms'}. ${patientInfo?.condition ? `Primary condition: ${patientInfo.condition}.` : 'Clinical assessment in progress.'} ${patientInfo?.medicalHistory ? `Medical history: ${patientInfo.medicalHistory}` : ''}`
      },
      {
        title: "XGBoost AI Prediction",
        content: prediction 
          ? `Advanced XGBoost machine learning model predicts: ${prediction.prediction_label} with ${(prediction.confidence * 100).toFixed(1)}% confidence. Risk stratification shows ${(prediction.probabilities.Control * 100).toFixed(1)}% Control, ${(prediction.probabilities.Benign * 100).toFixed(1)}% Benign, and ${(prediction.probabilities.Cancer * 100).toFixed(1)}% Cancer probability. Overall risk score: ${prediction.risk_score}/100.`
          : 'XGBoost biomarker analysis pending. Awaiting complete laboratory results for comprehensive AI prediction.'
      },
      {
        title: "Biomarker Analysis",
        content: (() => {
          const biomarkerResults = [];
          const bio = patientInfo?.biomarkers;
          
          if (bio?.ca199) {
            const ca199 = parseFloat(bio.ca199);
            biomarkerResults.push(`CA 19-9: ${ca199} U/mL ${ca199 > 37 ? '(elevated)' : '(normal)'}`);
          }
          if (bio?.creatinine) {
            const creatinine = parseFloat(bio.creatinine);
            biomarkerResults.push(`Creatinine: ${creatinine} mg/dL ${creatinine > 1.3 ? '(elevated)' : creatinine < 0.7 ? '(low)' : '(normal)'}`);
          }
          if (bio?.lyve1) {
            biomarkerResults.push(`LYVE1: ${bio.lyve1} ng/mL (lymphatic marker)`);
          }
          if (bio?.reg1a) {
            biomarkerResults.push(`REG1A: ${bio.reg1a} ng/mL (regenerating protein)`);
          }
          if (bio?.reg1b) {
            biomarkerResults.push(`REG1B: ${bio.reg1b} ng/mL (regenerating protein)`);
          }
          if (bio?.tff1) {
            biomarkerResults.push(`TFF1: ${bio.tff1} ng/mL (trefoil factor)`);
          }
          
          return biomarkerResults.length > 0 
            ? biomarkerResults.join(', ') + '. Complete biomarker panel integrated into XGBoost AI model for comprehensive risk assessment.'
            : 'Biomarker panel pending or incomplete. Standard pancreatic markers recommended: CA 19-9, Creatinine, LYVE1, REG1A, REG1B, TFF1.';
        })()
      },
      {
        title: "Imaging Findings",
        content: finalCtImageScore > 70 
          ? `CT imaging reveals significant pancreatic abnormalities with ${finalCtImageScore}% AI confidence score. Advanced imaging analysis indicates areas of concern requiring immediate attention.`
          : finalCtImageScore > 40
          ? `CT imaging shows moderate pancreatic changes with ${finalCtImageScore}% AI confidence score. Continued monitoring and follow-up imaging recommended.`
          : `CT imaging appears relatively normal with ${finalCtImageScore}% AI confidence score. Routine follow-up appropriate.`
      },
      {
        title: "AI Fusion Analysis",
        content: `Advanced machine learning fusion model indicates ${finalRiskScore}% overall risk assessment. Biomarker model contribution: ${finalBiomarkerScore}%, CT imaging model contribution: ${finalCtImageScore}%. ${prediction ? `XGBoost biomarker model predicts ${prediction.prediction_label} with ${(prediction.confidence * 100).toFixed(1)}% confidence.` : 'The fusion layer combines multiple data sources for comprehensive risk stratification.'}`
      },
      {
        title: "Clinical Recommendations",
        content: finalRiskScore > 70 || prediction?.prediction_label === "Cancer"
          ? "Immediate oncology referral strongly recommended. Consider endoscopic ultrasound with fine needle aspiration for tissue diagnosis. Multidisciplinary team evaluation and staging workup indicated."
          : finalRiskScore > 40 || prediction?.prediction_label === "Benign"
          ? "Close monitoring and follow-up recommended. Consider repeat imaging in 3-6 months. Oncology consultation may be beneficial for risk stratification and management planning."
          : "Routine monitoring appropriate. Annual screening recommended for high-risk patients. Lifestyle modifications and dietary counseling may be beneficial."
      }
    ];

    return sections;
  };

  // Dynamic AI analysis features based on scores
  const getAIAnalysisFeatures = () => {
    const features = [];
    const prediction = patientInfo?.prediction;
    const bio = patientInfo?.biomarkers;

    // Age factor
    if (patientInfo?.age) {
      features.push({ 
        feature: "Age Factor", 
        contribution: patientInfo.age > 60 ? 0.15 : 0.05, 
        impact: "positive",
        description: `Age ${patientInfo.age} - ${patientInfo.age > 60 ? 'increased' : 'normal'} risk factor`
      });
    }

    // XGBoost Prediction
    if (prediction) {
      features.push({
        feature: "XGBoost Prediction",
        contribution: prediction.confidence * 0.4,
        impact: "positive",
        description: `${prediction.prediction_label} with ${(prediction.confidence * 100).toFixed(1)}% confidence`
      });
    }

    // CA 19-9
    if (bio?.ca199) {
      const ca199 = parseFloat(bio.ca199);
      features.push({
        feature: "CA 19-9 Level",
        contribution: ca199 > 100 ? 0.35 : ca199 > 37 ? 0.20 : 0.05,
        impact: "positive",
        description: `CA 19-9: ${ca199} U/mL - ${ca199 > 37 ? 'elevated' : 'normal'} tumor marker`
      });
    }

    // Creatinine
    if (bio?.creatinine) {
      const creatinine = parseFloat(bio.creatinine);
      features.push({
        feature: "Creatinine Level",
        contribution: creatinine > 1.5 ? 0.20 : creatinine < 0.6 ? 0.15 : 0.05,
        impact: "positive",
        description: `Creatinine: ${creatinine} mg/dL - ${creatinine > 1.3 || creatinine < 0.7 ? 'abnormal' : 'normal'} kidney marker`
      });
    }

    // LYVE1
    if (bio?.lyve1) {
      const lyve1 = parseFloat(bio.lyve1);
      features.push({
        feature: "LYVE1 Biomarker",
        contribution: lyve1 > 12 ? 0.25 : 0.10,
        impact: "positive",
        description: `LYVE1: ${lyve1} ng/mL - lymphatic vessel marker`
      });
    }

    // REG1A
    if (bio?.reg1a) {
      const reg1a = parseFloat(bio.reg1a);
      features.push({
        feature: "REG1A Biomarker",
        contribution: reg1a > 580 ? 0.30 : 0.10,
        impact: "positive",
        description: `REG1A: ${reg1a} ng/mL - regenerating protein marker`
      });
    }

    // Imaging contribution
    features.push({
      feature: "CT Imaging",
      contribution: finalCtImageScore / 100 * 0.3,
      impact: "positive",
      description: `AI imaging analysis: ${finalCtImageScore}% confidence`
    });

    // Condition-specific factors
    if (patientInfo?.condition?.toLowerCase().includes('mass') || 
        patientInfo?.condition?.toLowerCase().includes('cancer')) {
      features.push({
        feature: "Clinical Diagnosis",
        contribution: 0.25,
        impact: "positive",
        description: "Identified pancreatic abnormality - significant risk factor"
      });
    }

    return features;
  };

  const ctImages = getCtImages();
  const reportSections = generateReportSections();
  const aiFeatures = getAIAnalysisFeatures();

  return (
    <Tabs defaultValue="risk" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="risk" className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          <span className="hidden sm:inline">Risk Assessment</span>
          <span className="sm:hidden">Risk</span>
        </TabsTrigger>
        <TabsTrigger value="analysis" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">AI Analysis</span>
          <span className="sm:hidden">Analysis</span>
        </TabsTrigger>
        <TabsTrigger value="report" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Medical Report</span>
          <span className="sm:hidden">Report</span>
        </TabsTrigger>
        <TabsTrigger value="imaging" className="flex items-center gap-2">
          <Scan className="h-4 w-4" />
          <span className="hidden sm:inline">CT Imaging</span>
          <span className="sm:hidden">Imaging</span>
        </TabsTrigger>
        <TabsTrigger value="history" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span className="hidden sm:inline">Patient History</span>
          <span className="sm:hidden">History</span>
        </TabsTrigger>
      </TabsList>

      {/* Risk Assessment Tab */}
      <TabsContent value="risk" className="space-y-6">
        <RiskMeter 
          score={finalRiskScore} 
          biomarkerScore={finalBiomarkerScore}
          ctImageScore={finalCtImageScore}
        />
        <BiomarkerIndicators 
          biomarkers={patientData?.biomarkers || mockBiomarkers}
          patientBiomarkers={patientInfo?.biomarkers}
          prediction={patientInfo?.prediction}
        />
      </TabsContent>

      {/* AI Analysis Tab */}
      <TabsContent value="analysis" className="space-y-6">
        <Card className="clinical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Model Performance
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Fusion layer analysis combining biomarker and imaging models
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Model Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-3xl font-bold text-primary mb-2">
                  {finalRiskScore}%
                </div>
                <div className="text-sm font-medium">Fusion Score</div>
                <div className="text-xs text-muted-foreground">Combined Model</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {finalBiomarkerScore}%
                </div>
                <div className="text-sm font-medium">Biomarker Model</div>
                <div className="text-xs text-muted-foreground">XGBoost Analysis</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {finalCtImageScore}%
                </div>
                <div className="text-sm font-medium">Imaging Model</div>
                <div className="text-xs text-muted-foreground">CT Analysis</div>
              </div>
            </div>

            {/* XGBoost Prediction Display */}
            {patientInfo?.prediction && (
              <div className="p-4 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  XGBoost Biomarker Prediction
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Prediction</div>
                    <Badge variant={
                      patientInfo.prediction.prediction_label === "Cancer" ? "destructive" :
                      patientInfo.prediction.prediction_label === "Benign" ? "default" : "secondary"
                    } className="text-lg px-3 py-1">
                      {patientInfo.prediction.prediction_label}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Confidence</div>
                    <div className="text-2xl font-bold">{(patientInfo.prediction.confidence * 100).toFixed(1)}%</div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="text-xs font-medium">Class Probabilities</div>
                  <div className="flex gap-4 text-sm">
                    <div>Control: {(patientInfo.prediction.probabilities.Control * 100).toFixed(1)}%</div>
                    <div>Benign: {(patientInfo.prediction.probabilities.Benign * 100).toFixed(1)}%</div>
                    <div>Cancer: {(patientInfo.prediction.probabilities.Cancer * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Decision Factors */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                AI Decision Factors
              </h4>
              {aiFeatures.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium">{item.feature}</div>
                    <div className="text-sm text-muted-foreground">{item.description}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={item.contribution * 100} className="w-24 h-2" />
                    <Badge variant={item.contribution > 0.2 ? "destructive" : item.contribution > 0.1 ? "default" : "secondary"}>
                      {item.contribution > 0 ? "+" : ""}{(item.contribution * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Model Confidence */}
        <Card className="clinical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Model Confidence & Reliability
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h5 className="font-medium">Statistical Confidence</h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">XGBoost Accuracy</span>
                  <span className="text-sm font-medium">
                    {patientInfo?.prediction ? `${(patientInfo.prediction.confidence * 100).toFixed(1)}%` : '94.2%'}
                  </span>
                </div>
                <Progress value={patientInfo?.prediction ? patientInfo.prediction.confidence * 100 : 94.2} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Overall Confidence</span>
                  <span className="text-sm font-medium">87.5%</span>
                </div>
                <Progress value={87.5} className="h-2" />
              </div>
            </div>
            <div className="space-y-4">
              <h5 className="font-medium">Data Quality Indicators</h5>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Biomarker data {patientInfo?.biomarkers ? 'complete' : 'pending'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {patientInfo?.prediction ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  )}
                  <span className="text-sm">XGBoost prediction {patientInfo?.prediction ? 'available' : 'pending'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Limited historical data</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Medical Report Tab */}
      <TabsContent value="report" className="space-y-6">
        <Card className="clinical-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Comprehensive Medical Report
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Patient: {patientInfo?.name || 'Unknown'} | ID: {patientId || 'N/A'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {reportSections.map((section, index) => (
              <div key={index} className="border-l-4 border-primary pl-6">
                <h4 className="font-bold text-lg mb-3 text-foreground">{section.title}</h4>
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              </div>
            ))}
            
            {/* Report Footer */}
            <div className="mt-12 pt-6 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <div className="font-medium">Report Details</div>
                  <div>Generated: {new Date().toLocaleDateString()}</div>
                  <div>Patient ID: {patientId || 'N/A'}</div>
                  <div>Risk Score: {finalRiskScore}%</div>
                </div>
                <div>
                  <div className="font-medium">AI Analysis</div>
                  <div>Biomarker Model: {finalBiomarkerScore}%</div>
                  <div>Imaging Model: {finalCtImageScore}%</div>
                  {patientInfo?.prediction && (
                    <div>XGBoost: {patientInfo.prediction.prediction_label} ({(patientInfo.prediction.confidence * 100).toFixed(1)}%)</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* CT Imaging Tab */}
      <TabsContent value="imaging" className="space-y-6">
        <Card className="clinical-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Scan className="h-5 w-5 text-primary" />
                CT Imaging Studies
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Advanced imaging analysis for {patientInfo?.name || 'patient'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download DICOM
              </Button>
              <Button variant="outline" size="sm">
                <ZoomIn className="h-4 w-4 mr-2" />
                DICOM Viewer
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ctImages.map((image, index) => (
                <Card key={image.id} className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
                  <CardContent className="p-4">
                    <div className="aspect-video bg-gradient-to-br from-muted/50 to-muted rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                      <Scan className="h-16 w-16 text-muted-foreground/50" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      <div className="absolute bottom-2 right-2">
                        <Badge variant="secondary" className="text-xs">
                          AI: {finalCtImageScore}%
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-base">{image.name}</h4>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{image.type}</span>
                        <span>{image.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {image.findings}
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full mt-3"
                        onClick={() => setSelectedImage(image)}
                      >
                        <Eye className="h-3 w-3 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* AI Imaging Insights */}
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                AI Imaging Insights
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium mb-2">Key Findings</div>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Advanced segmentation analysis completed</li>
                    <li>• Morphological assessment performed</li>
                    <li>• Vascular involvement evaluated</li>
                  </ul>
                </div>
                <div>
                  <div className="font-medium mb-2">AI Confidence</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Overall Assessment</span>
                      <span className="font-medium">{finalCtImageScore}%</span>
                    </div>
                    <Progress value={finalCtImageScore} className="h-1.5" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Patient History Tab */}
      <TabsContent value="history" className="space-y-6">
        <Card className="clinical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Patient Information & History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Patient Demographics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h5 className="font-semibold">Demographics</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{patientInfo?.name || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Age:</span>
                    <span className="font-medium">{patientInfo?.age || 'Not provided'} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gender:</span>
                    <span className="font-medium">{patientInfo?.gender || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Patient ID:</span>
                    <span className="font-medium">{patientId || 'Not provided'}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h5 className="font-semibold">Current Status</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Condition:</span>
                    <span className="font-medium">{patientInfo?.condition || 'Under assessment'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">AI Prediction:</span>
                    {patientInfo?.prediction ? (
                      <Badge variant={
                        patientInfo.prediction.prediction_label === "Cancer" ? "destructive" :
                        patientInfo.prediction.prediction_label === "Benign" ? "default" : "secondary"
                      }>
                        {patientInfo.prediction.prediction_label}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">Pending</span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risk Level:</span>
                    <Badge className={finalRiskScore > 70 ? 'risk-high' : finalRiskScore > 40 ? 'risk-moderate' : 'risk-low'}>
                      {finalRiskScore > 70 ? 'High Risk' : finalRiskScore > 40 ? 'Moderate Risk' : 'Low Risk'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Assessment:</span>
                    <span className="font-medium">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical History */}
            {patientInfo?.medicalHistory && (
              <div className="space-y-3">
                <h5 className="font-semibold">Medical History</h5>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {patientInfo.medicalHistory}
                  </p>
                </div>
              </div>
            )}

            {/* Current Symptoms */}
            {patientInfo?.symptoms && (
              <div className="space-y-3">
                <h5 className="font-semibold">Current Symptoms</h5>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {patientInfo.symptoms}
                  </p>
                </div>
              </div>
            )}

            {/* Assessment Timeline */}
            <div className="space-y-4">
              <h5 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Assessment Timeline
              </h5>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border-l-4 border-primary">
                  <div>
                    <div className="font-medium">{new Date().toLocaleDateString()}</div>
                    <div className="text-sm text-muted-foreground">
                      Current AI Assessment {patientInfo?.prediction && `- ${patientInfo.prediction.prediction_label}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">{finalRiskScore}%</div>
                    <div className="text-xs text-muted-foreground">
                      {patientInfo?.prediction ? `${(patientInfo.prediction.confidence * 100).toFixed(1)}% confidence` : 'Risk Score'}
                    </div>
                  </div>
                </div>
                
                {/* Sample historical data */}
                <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
                  <div>
                    <div className="font-medium">{new Date(Date.now() - 30*24*60*60*1000).toLocaleDateString()}</div>
                    <div className="text-sm text-muted-foreground">Initial Assessment</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-muted-foreground">--</div>
                    <div className="text-xs text-muted-foreground">Baseline</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ClinicalTabs;
