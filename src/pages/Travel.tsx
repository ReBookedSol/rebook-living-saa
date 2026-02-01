import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Train, 
  Bus, 
  Car, 
  MapPin, 
  DollarSign, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Info,
  ArrowRight
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import GautrainInfo from "@/components/GautrainInfo";

// Gautrain stations
const GAUTRAIN_STATIONS = [
  { name: "O.R. Tambo International", code: "ORT", line: "Airport Line", zone: 1 },
  { name: "Rhodesfield", code: "RHO", line: "Airport Line", zone: 2 },
  { name: "Marlboro", code: "MAR", line: "North-South Line", zone: 3 },
  { name: "Sandton", code: "SAN", line: "North-South Line", zone: 4 },
  { name: "Rosebank", code: "ROS", line: "North-South Line", zone: 5 },
  { name: "Park Station", code: "PAR", line: "North-South Line", zone: 6 },
  { name: "Midrand", code: "MID", line: "North-South Line", zone: 7 },
  { name: "Centurion", code: "CEN", line: "North-South Line", zone: 8 },
  { name: "Pretoria", code: "PTA", line: "North-South Line", zone: 9 },
  { name: "Hatfield", code: "HAT", line: "North-South Line", zone: 10 },
];

// University to accommodation to transportation mapping
const TRANSPORTATION_OPTIONS = [
  {
    university: "University of Pretoria",
    station: "Hatfield",
    options: [
      { method: "Gautrain", fare: "R76-110", time: "15-25 mins", frequency: "Every 15 mins" },
      { method: "Uber/Bolt", fare: "R50-150", time: "15-30 mins", frequency: "On demand" },
      { method: "Minibus Taxi", fare: "R15-30", time: "20-40 mins", frequency: "Throughout day" },
      { method: "Bus", fare: "R20-40", time: "30-50 mins", frequency: "Hourly" },
    ]
  },
  {
    university: "Wits University",
    station: "Park Station/Rosebank",
    options: [
      { method: "Gautrain", fare: "R76-124", time: "15-25 mins", frequency: "Every 15 mins" },
      { method: "Uber/Bolt", fare: "R40-120", time: "10-20 mins", frequency: "On demand" },
      { method: "Minibus Taxi", fare: "R15-30", time: "20-40 mins", frequency: "Throughout day" },
      { method: "Bus", fare: "R20-40", time: "30-50 mins", frequency: "Hourly" },
    ]
  },
  {
    university: "University of Johannesburg",
    station: "Rosebank/Sandton",
    options: [
      { method: "Gautrain", fare: "R76-92", time: "10-20 mins", frequency: "Every 15 mins" },
      { method: "Uber/Bolt", fare: "R60-140", time: "15-25 mins", frequency: "On demand" },
      { method: "Minibus Taxi", fare: "R15-30", time: "20-40 mins", frequency: "Throughout day" },
      { method: "Bus", fare: "R20-40", time: "30-50 mins", frequency: "Hourly" },
    ]
  },
  {
    university: "UNISA",
    station: "Pretoria/Hatfield",
    options: [
      { method: "Gautrain", fare: "R76-110", time: "15-25 mins", frequency: "Every 15 mins" },
      { method: "Uber/Bolt", fare: "R50-130", time: "15-30 mins", frequency: "On demand" },
      { method: "Minibus Taxi", fare: "R15-30", time: "20-40 mins", frequency: "Throughout day" },
      { method: "Bus", fare: "R20-40", time: "30-50 mins", frequency: "Hourly" },
    ]
  },
  {
    university: "Tshwane University of Technology (TUT)",
    station: "Pretoria/Centurion",
    options: [
      { method: "Gautrain", fare: "R76-92", time: "15-25 mins", frequency: "Every 15 mins" },
      { method: "Uber/Bolt", fare: "R40-110", time: "15-30 mins", frequency: "On demand" },
      { method: "Minibus Taxi", fare: "R15-30", time: "20-40 mins", frequency: "Throughout day" },
      { method: "Bus", fare: "R20-40", time: "30-50 mins", frequency: "Hourly" },
    ]
  },
];

export default function Travel() {
  const [expandedUniversity, setExpandedUniversity] = useState<string | null>(null);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <h1 className="text-4xl font-bold">Travel & Transportation</h1>
            </div>
            <p className="text-emerald-100 text-lg max-w-2xl">
              Explore all transportation options from your accommodation to universities across Johannesburg and Pretoria. 
              Calculate fares, check schedules, and find the best commute for your lifestyle.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <Tabs defaultValue="gautrain" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="gautrain" className="flex items-center gap-2">
                <Train className="w-4 h-4" />
                <span className="hidden sm:inline">Gautrain</span>
              </TabsTrigger>
              <TabsTrigger value="accommodation-routes" className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                <span className="hidden sm:inline">Accommodation Routes</span>
              </TabsTrigger>
              <TabsTrigger value="other-transport" className="flex items-center gap-2">
                <Car className="w-4 h-4" />
                <span className="hidden sm:inline">Other Transport</span>
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span className="hidden sm:inline">Compare</span>
              </TabsTrigger>
            </TabsList>

            {/* Gautrain Tab */}
            <TabsContent value="gautrain" className="space-y-6">
              <GautrainInfo showFareCalculator={true} />
            </TabsContent>

            {/* Accommodation Routes Tab */}
            <TabsContent value="accommodation-routes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Accommodation to University Routes</CardTitle>
                  <CardDescription>
                    Compare transportation options from various accommodations to your university
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {TRANSPORTATION_OPTIONS.map((route) => (
                    <Collapsible
                      key={route.university}
                      open={expandedUniversity === route.university}
                      onOpenChange={(open) => setExpandedUniversity(open ? route.university : null)}
                    >
                      <Card className="overflow-hidden">
                        <CollapsibleTrigger asChild>
                          <div className="p-4 cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <MapPin className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{route.university}</p>
                                <p className="text-xs text-muted-foreground">Nearest Station: {route.station}</p>
                              </div>
                            </div>
                            {expandedUniversity === route.university ? (
                              <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="px-4 pb-4 pt-0 border-t bg-muted/30">
                            <div className="pt-3 space-y-3">
                              {route.options.map((option, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                  <div>
                                    <p className="font-medium text-sm">{option.method}</p>
                                    <p className="text-xs text-muted-foreground">{option.frequency}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-sm text-blue-600">{option.fare}</p>
                                    <p className="text-xs text-muted-foreground">{option.time}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Other Transport Tab */}
            <TabsContent value="other-transport" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Uber/Bolt */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Car className="w-5 h-5 text-pink-600" />
                      <CardTitle>Uber & Bolt</CardTitle>
                    </div>
                    <CardDescription>Ride-sharing services</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Typical Fares:</span>
                        <span className="text-sm font-semibold">R50-150</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Average Time:</span>
                        <span className="text-sm">15-30 mins</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Availability:</span>
                        <Badge variant="outline">24/7</Badge>
                      </div>
                    </div>
                    <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
                      <p className="text-xs text-pink-800">
                        <strong>Tip:</strong> Save money by using scheduled rides (UberPool/Bolt Lite). Peak hours (7-9 AM, 4-6 PM) have surge pricing.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Minibus Taxi */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Bus className="w-5 h-5 text-orange-600" />
                      <CardTitle>Minibus Taxis</CardTitle>
                    </div>
                    <CardDescription>Affordable shared transport</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Typical Fares:</span>
                        <span className="text-sm font-semibold">R15-30</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Average Time:</span>
                        <span className="text-sm">20-40 mins</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Availability:</span>
                        <Badge variant="outline">6 AM - 10 PM</Badge>
                      </div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-xs text-orange-800">
                        <strong>Tip:</strong> Most affordable option. Operate on fixed routes from major pickup points. Keep small change ready.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Public Buses */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Bus className="w-5 h-5 text-blue-600" />
                      <CardTitle>Public Buses (Metrobus/MyCiti)</CardTitle>
                    </div>
                    <CardDescription>Reliable public transport</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Typical Fares:</span>
                        <span className="text-sm font-semibold">R20-40</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Average Time:</span>
                        <span className="text-sm">30-50 mins</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Frequency:</span>
                        <Badge variant="outline">Hourly</Badge>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-800">
                        <strong>Tip:</strong> Get a Joburg Connect card for monthly passes and discounts. Check schedules in advance.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Walking & Cycling */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-green-600" />
                      <CardTitle>Walking & Cycling</CardTitle>
                    </div>
                    <CardDescription>Healthy & eco-friendly</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Cost:</span>
                        <span className="text-sm font-semibold text-green-600">Free</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Best for:</span>
                        <span className="text-sm">Distances &lt; 2km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Safety:</span>
                        <Badge variant="outline">Daytime recommended</Badge>
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs text-green-800">
                        <strong>Tip:</strong> Consider bike sharing apps in Johannesburg for longer distances. Use well-lit, populated routes.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Comparison Tab */}
            <TabsContent value="comparison" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Transportation Methods Comparison</CardTitle>
                  <CardDescription>Compare cost, time, convenience, and frequency</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2 font-semibold">Transport</th>
                          <th className="text-center py-2 px-2 font-semibold">Cost</th>
                          <th className="text-center py-2 px-2 font-semibold">Speed</th>
                          <th className="text-center py-2 px-2 font-semibold">Frequency</th>
                          <th className="text-center py-2 px-2 font-semibold">Comfort</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b hover:bg-muted/50">
                          <td className="py-3 px-2 flex items-center gap-2">
                            <Train className="w-4 h-4 text-blue-600" />
                            Gautrain
                          </td>
                          <td className="text-center text-yellow-600 font-medium">★★★☆☆</td>
                          <td className="text-center text-green-600 font-medium">★★★★★</td>
                          <td className="text-center text-green-600 font-medium">★★★★☆</td>
                          <td className="text-center text-green-600 font-medium">★★★★★</td>
                        </tr>
                        <tr className="border-b hover:bg-muted/50">
                          <td className="py-3 px-2 flex items-center gap-2">
                            <Car className="w-4 h-4 text-pink-600" />
                            Uber/Bolt
                          </td>
                          <td className="text-center text-orange-600 font-medium">★★☆☆☆</td>
                          <td className="text-center text-green-600 font-medium">★★★★☆</td>
                          <td className="text-center text-green-600 font-medium">★★★★★</td>
                          <td className="text-center text-green-600 font-medium">★★★★★</td>
                        </tr>
                        <tr className="border-b hover:bg-muted/50">
                          <td className="py-3 px-2 flex items-center gap-2">
                            <Bus className="w-4 h-4 text-orange-600" />
                            Minibus Taxi
                          </td>
                          <td className="text-center text-green-600 font-medium">★★★★★</td>
                          <td className="text-center text-orange-600 font-medium">★★★☆☆</td>
                          <td className="text-center text-green-600 font-medium">★★★★☆</td>
                          <td className="text-center text-orange-600 font-medium">★★☆☆☆</td>
                        </tr>
                        <tr className="border-b hover:bg-muted/50">
                          <td className="py-3 px-2 flex items-center gap-2">
                            <Bus className="w-4 h-4 text-blue-600" />
                            Public Bus
                          </td>
                          <td className="text-center text-orange-600 font-medium">★★★★☆</td>
                          <td className="text-center text-orange-600 font-medium">★★★☆☆</td>
                          <td className="text-center text-yellow-600 font-medium">★★★☆☆</td>
                          <td className="text-center text-orange-600 font-medium">★★★☆☆</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mt-8">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-2">Budget-Conscious?</h4>
                      <p className="text-sm text-green-800">
                        Use minibus taxis (R15-30) for the cheapest option. Buy a monthly Gautrain pass for frequent travel.
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">Value for Money?</h4>
                      <p className="text-sm text-blue-800">
                        Gautrain monthly passes (R1,422-4,114) offer 15% savings and are most reliable for daily commutes.
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-900 mb-2">Maximum Convenience?</h4>
                      <p className="text-sm text-purple-800">
                        Use Uber/Bolt for door-to-door convenience. More expensive but saves time and stress.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-amber-600" />
                    <CardTitle className="text-amber-900">Money-Saving Tips</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-amber-900">
                  <p>• <strong>Gautrain:</strong> Monthly passes save up to 15% vs single trips. Valid for 44 days.</p>
                  <p>• <strong>Uber/Bolt:</strong> Use Lite versions (UberPool) during off-peak hours for discounts.</p>
                  <p>• <strong>Joburg Connect:</strong> Public bus monthly pass offers discounts on Metrobus routes.</p>
                  <p>• <strong>Combination:</strong> Mix transport methods (walk 1km + Gautrain) to save money.</p>
                  <p>• <strong>Student Discounts:</strong> Ask about student rates at Gautrain stations (up to 20% off).</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
