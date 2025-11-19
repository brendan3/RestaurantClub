import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Upload, Globe, Lock, Users, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

export default function CreateClub() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    privacy: "public",
    location: "",
    vibe: "casual"
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send data to backend
    toast({
      title: "Club Created! 🎉",
      description: `"${formData.name}" is now live. Time to eat!`,
    });
    setLocation("/club");
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/club")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-heading font-bold">Start a Club</h1>
          <p className="text-muted-foreground">Gather your crew for a culinary journey.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Step 1: Identity */}
            <div className={`space-y-6 animate-in fade-in slide-in-from-left-4 duration-500 ${step !== 1 ? 'hidden' : ''}`}>
              <div className="space-y-2">
                <Label htmlFor="name">Club Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. The Burger Barons" 
                  className="h-12 text-lg font-bold"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Mission Statement</Label>
                <Textarea 
                  id="description" 
                  placeholder="What's your goal? Finding the best taco? Monthly fine dining?" 
                  className="resize-none min-h-[100px]"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Base Location</Label>
                <Input 
                   placeholder="e.g. New York, NY" 
                   value={formData.location}
                   onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
            </div>

            {/* Step 2: Vibe & Privacy */}
            <div className={`space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 ${step !== 2 ? 'hidden' : ''}`}>
              <div className="space-y-3">
                <Label>Club Vibe</Label>
                <div className="grid grid-cols-3 gap-3">
                  {['casual', 'fancy', 'adventurous'].map((vibe) => (
                    <div 
                      key={vibe}
                      onClick={() => setFormData({...formData, vibe})}
                      className={`cursor-pointer border-2 rounded-xl p-4 text-center hover:bg-muted/50 transition-all ${formData.vibe === vibe ? 'border-primary bg-primary/5' : 'border-border'}`}
                    >
                      <div className="text-2xl mb-2">
                        {vibe === 'casual' && '🍔'}
                        {vibe === 'fancy' && '🥂'}
                        {vibe === 'adventurous' && '🌶️'}
                      </div>
                      <div className="capitalize font-bold text-sm">{vibe}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Privacy Setting</Label>
                <RadioGroup 
                  defaultValue="public" 
                  value={formData.privacy}
                  onValueChange={(val) => setFormData({...formData, privacy: val})}
                  className="grid grid-cols-1 gap-3"
                >
                  <div className={`flex items-center space-x-3 border p-4 rounded-xl cursor-pointer transition-colors ${formData.privacy === 'public' ? 'border-primary bg-primary/5' : ''}`}>
                    <RadioGroupItem value="public" id="public" />
                    <Label htmlFor="public" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 font-bold text-base">
                        <Globe className="w-4 h-4 text-primary" /> Public
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Anyone can discover and request to join.</p>
                    </Label>
                  </div>
                  <div className={`flex items-center space-x-3 border p-4 rounded-xl cursor-pointer transition-colors ${formData.privacy === 'private' ? 'border-primary bg-primary/5' : ''}`}>
                    <RadioGroupItem value="private" id="private" />
                    <Label htmlFor="private" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 font-bold text-base">
                        <Lock className="w-4 h-4 text-primary" /> Private
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Invite only. Hidden from discovery.</p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Step 3: Cover Image */}
            <div className={`space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 ${step !== 3 ? 'hidden' : ''}`}>
               <div className="border-2 border-dashed border-muted-foreground/25 rounded-2xl p-10 text-center hover:bg-muted/20 transition-colors cursor-pointer">
                 <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                 <p className="font-bold text-lg">Upload Cover Photo</p>
                 <p className="text-sm text-muted-foreground mt-1">Or drag and drop an image here</p>
               </div>
               
               <div className="bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100 p-4 rounded-xl text-sm flex gap-3 items-start">
                 <Info className="w-5 h-5 shrink-0 mt-0.5" />
                 <p>Tip: Food photos work best! Choose something that represents your club's style.</p>
               </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                  Back
                </Button>
              )}
              {step < 3 ? (
                <Button type="button" onClick={handleNext} className="flex-1" disabled={!formData.name}>
                  Next Step
                </Button>
              ) : (
                <Button type="submit" className="flex-1 gap-2 font-bold">
                  <Check className="w-4 h-4" /> Launch Club
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Preview Card */}
        <div className="hidden md:block">
          <div className="sticky top-24 space-y-4">
            <h3 className="font-heading font-bold text-sm uppercase text-muted-foreground tracking-wider">Preview</h3>
            
            <div className="bg-card rounded-2xl overflow-hidden border shadow-lg">
              <div className="h-40 bg-muted relative">
                {/* Placeholder for uploaded image */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 right-3">
                   <Badge variant="secondary" className="backdrop-blur-md bg-black/50 text-white border-none">
                     {formData.privacy === "private" ? <Lock className="w-3 h-3 mr-1" /> : <Globe className="w-3 h-3 mr-1" />}
                     {formData.privacy === "public" ? "Public" : "Private"}
                   </Badge>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="font-bold text-xl leading-tight">{formData.name || "Club Name"}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    1 Member • {formData.location || "Location"}
                  </p>
                </div>
                <p className="text-sm text-foreground/80 line-clamp-3 min-h-[3rem]">
                  {formData.description || "Your club's mission statement will appear here..."}
                </p>
                <div className="flex gap-2 pt-2">
                  <Badge variant="outline" className="capitalize">{formData.vibe}</Badge>
                </div>
                <Button size="sm" className="w-full rounded-full font-bold mt-2" disabled>
                  Join Club
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
