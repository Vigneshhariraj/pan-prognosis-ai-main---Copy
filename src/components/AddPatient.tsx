import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  UserPlus,
  Upload,
  FileText,
  Scan,
  Save,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  X,
  Activity
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface NewPatient {
  name: string;
  age: string;
  gender: string;
  mrn: string;
  condition: string;
  symptoms: string;
  medicalHistory: string;
  
  // Updated biomarkers
  ca199: string;
  creatinine: string;
  lyve1: string;
  reg1a: string;
  reg1b: string;
  tff1: string;
  
  reportFile: File | null;
  ctImageFiles: File[];
  contactNumber: string;
  emergencyContact: string;
  allergies: string;
  currentMedications: string;
}

interface AddPatientProps {
  onAddPatient: (patient: any) => void;
}

interface BiomarkerPrediction {
  prediction_class: number;
  prediction_label: string;
  confidence: number;
  risk_score: number;
  probabilities: {
    Control: number;
    Benign: number;
    Cancer: number;
  };
}

const AddPatient = ({ onAddPatient }: AddPatientProps) => {
  const [formData, setFormData] = useState<NewPatient>({
    name: "",
    age: "",
    gender: "",
    mrn: "",
    condition: "",
    symptoms: "",
    medicalHistory: "",
    ca199: "",
    creatinine: "",
    lyve1: "",
    reg1a: "",
    reg1b: "",
    tff1: "",
    reportFile: null,
    ctImageFiles: [],
    contactNumber: "",
    emergencyContact: "",
    allergies: "",
    currentMedications: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [biomarkerPrediction, setBiomarkerPrediction] = useState<BiomarkerPrediction | null>(null);

  const handleInputChange = (field: keyof NewPatient, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (type: 'report' | 'ctImages', files: FileList | null) => {
    if (!files) return;

    if (type === 'report' && files[0]) {
      setFormData(prev => ({
        ...prev,
        reportFile: files[0]
      }));
      toast({
        title: "Report Uploaded",
        description: `${files[0].name} has been uploaded successfully.`
      });
    } else if (type === 'ctImages') {
      const newFiles = Array.from(files);
      setFormData(prev => ({
        ...prev,
        ctImageFiles: [...prev.ctImageFiles, ...newFiles]
      }));
      toast({
        title: "CT Images Uploaded",
        description: `${newFiles.length} CT image(s) uploaded successfully.`
      });
    }
  };

  const removeCtImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ctImageFiles: prev.ctImageFiles.filter((_, i) => i !== index)
    }));
  };

  const generateMRN = () => {
    const mrn = `MRN-${Date.now().toString().slice(-9)}`;
    setFormData(prev => ({
      ...prev,
      mrn
    }));
  };

  const predictFromBiomarkers = async () => {
    const requiredBiomarkers = ['age', 'gender', 'ca199', 'creatinine', 'lyve1', 'reg1a', 'reg1b', 'tff1'];
    const missingBiomarkers = requiredBiomarkers.filter(field => !formData[field as keyof NewPatient]);
    
    if (missingBiomarkers.length > 0) {
      toast({
        title: "Missing Biomarker Data",
        description: `Please fill in: ${missingBiomarkers.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    setIsPredicting(true);

    try {
      const biomarkerData = {
        age: parseFloat(formData.age),
        sex: formData.gender === "Male" ? "M" : "F",
        plasma_CA19_9: parseFloat(formData.ca199),
        creatinine: parseFloat(formData.creatinine),
        LYVE1: parseFloat(formData.lyve1),
        REG1A: parseFloat(formData.reg1a),
        REG1B: parseFloat(formData.reg1b),
        TFF1: parseFloat(formData.tff1)
      };

      const response = await fetch('http://localhost:5000/api/predict/biomarkers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(biomarkerData)
      });

      if (!response.ok) {
        throw new Error('Prediction API failed');
      }

      const result = await response.json();
      
      if (result.success) {
        setBiomarkerPrediction(result);
        toast({
          title: "Biomarker Analysis Complete",
          description: `Prediction: ${result.prediction_label} (${(result.confidence * 100).toFixed(1)}%)`,
        });
      } else {
        throw new Error(result.error || 'Unknown error');
      }

    } catch (error) {
      console.error('Biomarker prediction error:', error);
      toast({
        title: "Prediction Failed",
        description: "Could not connect to prediction service. Using fallback.",
        variant: "destructive"
      });
      
      const localRiskScore = calculateLocalRiskScore();
      setBiomarkerPrediction({
        prediction_class: localRiskScore < 40 ? 0 : localRiskScore < 70 ? 1 : 2,
        prediction_label: localRiskScore < 40 ? "Control" : localRiskScore < 70 ? "Benign" : "Cancer",
        confidence: 0.75,
        risk_score: localRiskScore,
        probabilities: {
          Control: localRiskScore < 40 ? 0.75 : 0.15,
          Benign: localRiskScore >= 40 && localRiskScore < 70 ? 0.75 : 0.20,
          Cancer: localRiskScore >= 70 ? 0.75 : 0.05
        }
      });
    } finally {
      setIsPredicting(false);
    }
  };

  const calculateLocalRiskScore = () => {
    const ca199Val = parseFloat(formData.ca199) || 0;
    const creatinineVal = parseFloat(formData.creatinine) || 0;
    const ageVal = parseFloat(formData.age) || 0;
    
    let score = 0;

    if (ca199Val > 100) score += 30;
    else if (ca199Val > 37) score += 15;

    if (creatinineVal > 1.5) score += 15;
    else if (creatinineVal < 0.6) score += 10;

    if (ageVal > 60) score += 15;
    else if (ageVal > 50) score += 8;

    return Math.min(Math.max(score, 0), 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const requiredFields = ['name', 'age', 'gender', 'mrn'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof NewPatient]);

    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    try {
      if (!biomarkerPrediction && formData.ca199 && formData.creatinine) {
        await predictFromBiomarkers();
      }

      const riskScore = biomarkerPrediction?.risk_score || calculateLocalRiskScore();

      const newPatient = {
        id: `P${String(Date.now()).slice(-3)}`,
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        mrn: formData.mrn,
        condition: formData.condition || biomarkerPrediction?.prediction_label || "Under Assessment",
        lastVisit: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        riskLevel: riskScore < 40 ? "low" : riskScore < 70 ? "moderate" : "high",
        riskScore: riskScore,
        biomarkerScore: riskScore,
        ctImageScore: Math.min(riskScore + 15, 100),
        nextAppointment: "Pending Schedule",
        contactNumber: formData.contactNumber,
        symptoms: formData.symptoms,
        medicalHistory: formData.medicalHistory,
        biomarkers: {
          ca199: formData.ca199,
          creatinine: formData.creatinine,
          lyve1: formData.lyve1,
          reg1a: formData.reg1a,
          reg1b: formData.reg1b,
          tff1: formData.tff1
        },
        prediction: biomarkerPrediction,
        files: {
          report: formData.reportFile,
          ctImages: formData.ctImageFiles
        }
      };

      onAddPatient(newPatient);

      toast({
        title: "Patient Added Successfully!",
        description: `${formData.name} has been added to the patient database.`
      });

      resetForm();

    } catch (error) {
      toast({
        title: "Error Adding Patient",
        description: "There was an error adding the patient. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      age: "",
      gender: "",
      mrn: "",
      condition: "",
      symptoms: "",
      medicalHistory: "",
      ca199: "",
      creatinine: "",
      lyve1: "",
      reg1a: "",
      reg1b: "",
      tff1: "",
      reportFile: null,
      ctImageFiles: [],
      contactNumber: "",
      emergencyContact: "",
      allergies: "",
      currentMedications: ""
    });
    setBiomarkerPrediction(null);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add New Patient
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter patient information and upload medical documents
            </p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter patient's full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder="Age in years"
                  min="0"
                  max="120"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mrn">Medical Record Number *</Label>
                <div className="flex gap-2">
                  <Input
                    id="mrn"
                    value={formData.mrn}
                    onChange={(e) => handleInputChange('mrn', e.target.value)}
                    placeholder="MRN-XXXXXXXXX"
                    required
                  />
                  <Button type="button" variant="outline" onClick={generateMRN}>
                    Generate
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                  placeholder="Phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  placeholder="Emergency contact number"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medical Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="condition">Primary Condition</Label>
              <Input
                id="condition"
                value={formData.condition}
                onChange={(e) => handleInputChange('condition', e.target.value)}
                placeholder="e.g., Pancreatic Mass, Chronic Pancreatitis"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="symptoms">Current Symptoms</Label>
              <Textarea
                id="symptoms"
                value={formData.symptoms}
                onChange={(e) => handleInputChange('symptoms', e.target.value)}
                placeholder="Describe current symptoms..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicalHistory">Medical History</Label>
              <Textarea
                id="medicalHistory"
                value={formData.medicalHistory}
                onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                placeholder="Past medical history, surgeries, etc..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergies">Known Allergies</Label>
              <Input
                id="allergies"
                value={formData.allergies}
                onChange={(e) => handleInputChange('allergies', e.target.value)}
                placeholder="List any known allergies"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentMedications">Current Medications</Label>
              <Input
                id="currentMedications"
                value={formData.currentMedications}
                onChange={(e) => handleInputChange('currentMedications', e.target.value)}
                placeholder="List current medications"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Biomarker Values (XGBoost Model)</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={predictFromBiomarkers}
                disabled={isPredicting}
              >
                {isPredicting ? (
                  <>
                    <Activity className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Activity className="mr-2 h-4 w-4" />
                    Predict Risk
                  </>
                )}
              </Button>
            </CardTitle>
            {biomarkerPrediction && (
              <div className="mt-2 p-3 rounded-lg bg-muted">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    Prediction: <Badge variant={
                      biomarkerPrediction.prediction_label === "Cancer" ? "destructive" :
                      biomarkerPrediction.prediction_label === "Benign" ? "default" : "secondary"
                    }>
                      {biomarkerPrediction.prediction_label}
                    </Badge>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Risk Score: {biomarkerPrediction.risk_score}/100
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Confidence: {(biomarkerPrediction.confidence * 100).toFixed(1)}% | 
                  Control: {(biomarkerPrediction.probabilities.Control * 100).toFixed(0)}% | 
                  Benign: {(biomarkerPrediction.probabilities.Benign * 100).toFixed(0)}% | 
                  Cancer: {(biomarkerPrediction.probabilities.Cancer * 100).toFixed(0)}%
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ca199">CA 19-9 (U/mL)</Label>
                <Input
                  id="ca199"
                  type="number"
                  step="0.01"
                  value={formData.ca199}
                  onChange={(e) => handleInputChange('ca199', e.target.value)}
                  placeholder="Normal: 0-37"
                />
                <p className="text-xs text-muted-foreground">Reference: 0-37 U/mL</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="creatinine">Creatinine (mg/dL)</Label>
                <Input
                  id="creatinine"
                  type="number"
                  step="0.01"
                  value={formData.creatinine}
                  onChange={(e) => handleInputChange('creatinine', e.target.value)}
                  placeholder="Normal: 0.7-1.3"
                />
                <p className="text-xs text-muted-foreground">Reference: 0.7-1.3 mg/dL</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lyve1">LYVE1 (ng/mL)</Label>
                <Input
                  id="lyve1"
                  type="number"
                  step="0.01"
                  value={formData.lyve1}
                  onChange={(e) => handleInputChange('lyve1', e.target.value)}
                  placeholder="Enter LYVE1 level"
                />
                <p className="text-xs text-muted-foreground">Lymphatic vessel marker</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg1a">REG1A (ng/mL)</Label>
                <Input
                  id="reg1a"
                  type="number"
                  step="0.01"
                  value={formData.reg1a}
                  onChange={(e) => handleInputChange('reg1a', e.target.value)}
                  placeholder="Enter REG1A level"
                />
                <p className="text-xs text-muted-foreground">Regenerating protein 1-alpha</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg1b">REG1B (ng/mL)</Label>
                <Input
                  id="reg1b"
                  type="number"
                  step="0.01"
                  value={formData.reg1b}
                  onChange={(e) => handleInputChange('reg1b', e.target.value)}
                  placeholder="Enter REG1B level"
                />
                <p className="text-xs text-muted-foreground">Regenerating protein 1-beta</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tff1">TFF1 (ng/mL)</Label>
                <Input
                  id="tff1"
                  type="number"
                  step="0.01"
                  value={formData.tff1}
                  onChange={(e) => handleInputChange('tff1', e.target.value)}
                  placeholder="Enter TFF1 level"
                />
                <p className="text-xs text-muted-foreground">Trefoil factor 1</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medical Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reportFile">Medical Report (PDF)</Label>
              <Input
                id="reportFile"
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileUpload('report', e.target.files)}
                className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-primary file:text-white"
              />
              {formData.reportFile && (
                <Badge variant="outline">
                  <FileText className="mr-1 h-3 w-3" />
                  {formData.reportFile.name}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctImages">CT Images (DICOM, JPG, PNG)</Label>
              <Input
                id="ctImages"
                type="file"
                accept=".dcm,.jpg,.jpeg,.png"
                multiple
                onChange={(e) => handleFileUpload('ctImages', e.target.files)}
                className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-primary file:text-white"
              />
              {formData.ctImageFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.ctImageFiles.map((file, index) => (
                    <Badge key={index} variant="outline" className="pr-1">
                      <Scan className="mr-1 h-3 w-3" />
                      {file.name}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => removeCtImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={resetForm}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Form
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Activity className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Add Patient
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddPatient;
