import React, { useState, useEffect } from "react";
import {
  Users,
  History,
  MapPin,
  ChevronRight,
  FileText,
  User,
} from "lucide-react";
import { db } from "../database/db";
import { Navigate, useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import { VillageInfo } from "../types";

const LandingPage: React.FC = () => {
  const [village, setVillage] = useState<VillageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();