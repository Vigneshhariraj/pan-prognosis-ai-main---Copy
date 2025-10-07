import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, User, FileText, TrendingUp, TrendingDown, ChevronRight, Search, Filter, TestTube, Scan } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  mrn: string;
  lastVisit: string;
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;
  biomarkerScore?: number; // Added
  ctImageScore?: number;    // Added
  condition?: string;
  nextAppointment?: string;
}

interface PatientListProps {
  patients: Patient[];
  onPatientSelect: (patient: Patient) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const PatientList = ({ patients, onPatientSelect, searchQuery, onSearchChange }: PatientListProps) => {
  const getRiskBadgeClass = (risk: string) => {
    switch (risk) {
      case "low":
        return "risk-low";
      case "moderate":
        return "risk-moderate";
      case "high":
        return "risk-high";
      default:
        return "risk-low";
    }
  };

  const getRiskLabel = (score: number) => {
    if (score < 40) return "Low Risk";
    if (score < 70) return "Moderate Risk";
    return "High Risk";
  };

  const getPatientInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const getRiskColor = (score: number) => {
    if (score < 40) return 'hsl(var(--risk-low))';
    if (score < 70) return 'hsl(var(--risk-moderate))';
    return 'hsl(var(--risk-high))';
  };

  // Filter patients based on search query
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.condition?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search and Filter Header */}
      <Card className="clinical-card border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              <span className="font-semibold">Patient Search</span>
            </div>
            <Badge variant="outline" className="bg-primary/10">
              {filteredPatients.length} patients • Click to view detailed assessment
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, MRN, or condition..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 form-input"
            />
          </div>
        </CardContent>
      </Card>

      {/* Patient List */}
      <div className="space-y-3">
        {filteredPatients.length === 0 ? (
          <Card className="clinical-card border-dashed">
            <CardContent className="py-12 text-center">
              <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-2">No patients found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search criteria or add a new patient.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPatients.map((patient) => (
            <Card
              key={patient.id}
              className="clinical-card hover:border-primary/40 transition-all duration-200 cursor-pointer"
              onClick={() => onPatientSelect(patient)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Patient Avatar */}
                  <Avatar className="w-14 h-14 border-2 border-primary/20">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.name}`} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getPatientInitials(patient.name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Patient Info */}
                  <div className="flex-1 min-w-0">
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-base mb-1 flex items-center gap-2">
                          {patient.name}
                          <Badge className={`${getRiskBadgeClass(patient.riskLevel)} text-xs`}>
                            {getRiskLabel(patient.riskScore)} • {patient.riskScore}
                          </Badge>
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {patient.age}y • {patient.gender}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            {patient.mrn}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </div>

                    {/* Condition */}
                    {patient.condition && (
                      <div className="mb-3">
                        <Badge variant="outline" className="text-xs bg-secondary/10">
                          {patient.condition}
                        </Badge>
                      </div>
                    )}

                    {/* Biomarker Visualization - NEW SECTION */}
                    {(patient.biomarkerScore || patient.ctImageScore) && (
                      <div className="mt-3 space-y-3 p-3 bg-secondary/5 rounded-lg border border-primary/10">
                        {/* Biomarker Model Score */}
                        {patient.biomarkerScore !== undefined && (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <TestTube className="w-3.5 h-3.5 text-primary" />
                                <span className="text-xs font-medium text-muted-foreground">Biomarker Model</span>
                              </div>
                              <span className="text-xs font-semibold" style={{ color: getRiskColor(patient.biomarkerScore) }}>
                                {patient.biomarkerScore}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-secondary/20 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${patient.biomarkerScore}%`,
                                  backgroundColor: getRiskColor(patient.biomarkerScore)
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* CT Image Model Score */}
                        {patient.ctImageScore !== undefined && (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Scan className="w-3.5 h-3.5 text-primary" />
                                <span className="text-xs font-medium text-muted-foreground">CT Image Model</span>
                              </div>
                              <span className="text-xs font-semibold" style={{ color: getRiskColor(patient.ctImageScore) }}>
                                {patient.ctImageScore}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-secondary/20 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${patient.ctImageScore}%`,
                                  backgroundColor: getRiskColor(patient.ctImageScore)
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Footer Info */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5" />
                        Last: {patient.lastVisit}
                      </span>
                      {patient.nextAppointment && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          Next: {patient.nextAppointment}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PatientList;
