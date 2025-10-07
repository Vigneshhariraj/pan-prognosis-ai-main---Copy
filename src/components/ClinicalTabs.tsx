import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  TestTube,
  Scan,
  FileText,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Download,
  Eye,
  Calendar,
  User,
  Stethoscope,
  FileBarChart,
  History,
} from "lucide-react";
import RiskMeter from "./RiskMeter";
import BiomarkerIndicators from "./BiomarkerIndicators";
import EnhancedBiomarkers from "./EnhancedBiomarkers";

interface Biomarker {
  name: string;
  value: string;
  unit: string;
  status: "elevated" | "normal" | "low";
  trend: "up" | "down" | "stable";
  referenceRange: string;
}

interface ClinicalTabsProps {
  patientId: string;
  patientInfo: any;
  patientData: {
    riskScore: number;
    biomarkerScore?: number;
    ctImageScore?: number;
    biomarkers: Biomarker[];
  };
  biomarkerScore?: number;
  ctImageScore?: number;
}

const ClinicalTabs = ({ 
  patientId, 
  patientInfo, 
  patientData,
  biomarkerScore,
  ctImageScore
}: ClinicalTabsProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock CT images data
  const mockCTImages = [
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=600",
      date: "Jan 15, 2024",
      type: "Axial CT",
      findings: "Hypodense mass in pancreatic head, 3.2cm. Possible vascular involvement.",
      status: "reviewed",
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=800&h=600",
      date: "Jan 15, 2024",
      type: "Coronal CT",
      findings: "Pancreatic duct dilation noted. Adjacent lymph nodes appear enlarged.",
      status: "reviewed",
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800&h=600",
      date: "Jan 15, 2024",
      type: "Sagittal CT",
      findings: "Mass extends posteriorly. Relationship to superior mesenteric vessels noted.",
      status: "pending",
    },
  ];

  // Mock reports data
  const mockReports = [
    {
      id: 1,
      title: "Pathology Report",
      date: "Jan 14, 2024",
      type: "Pathology",
      content:
        "Biopsy specimen shows adenocarcinoma with moderate differentiation. Immunohistochemistry positive for CK7, CK19, and CA19-9.",
    },
    {
      id: 2,
      title: "Radiology Report - CT Abdomen",
      date: "Jan 15, 2024",
      type: "Radiology",
      content:
        "3.2cm hypodense mass in pancreatic head. Mild pancreatic duct dilation. Possible vascular involvement requires further assessment.",
    },
    {
      id: 3,
      title: "Laboratory Results",
      date: "Jan 13, 2024",
      type: "Laboratory",
      content:
        "CA 19-9: 125 U/mL (elevated), CEA: 8.2 ng/mL (elevated), Lipase: 285 U/L (elevated). Complete blood count within normal limits.",
    },
  ];

  // Mock timeline data
  const timelineEvents = [
    {
      date: "Jan 15, 2024",
      time: "10:30 AM",
      event: "CT Scan Completed",
      status: "completed",
      details: "Abdominal CT with contrast",
    },
    {
      date: "Jan 14, 2024",
      time: "2:15 PM",
      event: "Biopsy Results Available",
      status: "completed",
      details: "Pathology confirms adenocarcinoma",
    },
    {
      date: "Jan 13, 2024",
      time: "9:00 AM",
      event: "Blood Work Collected",
      status: "completed",
      details: "Tumor markers and complete panel",
    },
    {
      date: "Jan 12, 2024",
      time: "3:30 PM",
      event: "Initial Consultation",
      status: "completed",
      details: "Dr. Sarah Smith - Oncology",
    },
  ];

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="biomarkers" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            <span className="hidden sm:inline">Biomarkers</span>
          </TabsTrigger>
          <TabsTrigger value="ct-images" className="flex items-center gap-2">
            <Scan className="h-4 w-4" />
            <span className="hidden sm:inline">CT Images</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Reports</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Risk Assessment */}
          <RiskMeter
            score={patientData.riskScore}
            biomarkerScore={biomarkerScore || patientData.biomarkerScore || 65}
            ctImageScore={ctImageScore || patientData.ctImageScore || 78}
            title="AI Cancer Risk Assessment"
            className="mb-6"
          />

          {/* Biomarker Summary */}
          <BiomarkerIndicators
            biomarkers={patientData.biomarkers}
            patientBiomarkers={patientInfo.biomarkers}
            className="mb-6"
          />

          {/* Recent Activity Timeline */}
          <Card className="clinical-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Recent Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timelineEvents.map((event, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {event.status === "completed" ? (
                          <CheckCircle className="w-5 h-5 text-primary" />
                        ) : (
                          <Clock className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-semibold text-sm">{event.event}</h4>
                        <Badge
                          variant={event.status === "completed" ? "default" : "outline"}
                          className="ml-2"
                        >
                          {event.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{event.details}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.date} at {event.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Biomarkers Tab */}
        <TabsContent value="biomarkers" className="space-y-6">
          <EnhancedBiomarkers biomarkers={patientData.biomarkers} />
        </TabsContent>

        {/* CT Images Tab */}
        <TabsContent value="ct-images" className="space-y-6">
          <Card className="clinical-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="w-5 h-5 text-primary" />
                CT Imaging Analysis
                <Badge variant="outline" className="ml-auto">
                  {mockCTImages.length} images
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockCTImages.map((image) => (
                  <Card key={image.id} className="overflow-hidden">
                    <div className="aspect-video bg-secondary/20 relative group cursor-pointer">
                      <img
                        src={image.url}
                        alt={image.type}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="sm" variant="secondary">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">{image.type}</h4>
                        <Badge
                          variant={image.status === "reviewed" ? "default" : "outline"}
                        >
                          {image.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{image.date}</p>
                      <p className="text-sm">{image.findings}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card className="clinical-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Medical Reports
                <Badge variant="outline" className="ml-auto">
                  {mockReports.length} reports
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockReports.map((report) => (
                  <Card key={report.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold mb-1">{report.title}</h4>
                          <p className="text-sm text-muted-foreground">{report.date}</p>
                        </div>
                        <Badge variant="outline">{report.type}</Badge>
                      </div>
                      <p className="text-sm mb-3">{report.content}</p>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card className="clinical-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Medical History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-primary" />
                    Symptoms
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {patientInfo.symptoms || "No symptoms recorded."}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <FileBarChart className="w-4 h-4 text-primary" />
                    Medical History
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {patientInfo.medicalHistory || "No medical history recorded."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClinicalTabs;
