import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import {
  getAllLSCertificates,
  saveLSCertificate,
  deleteLSCertificate as deleteFromLS,
} from "@/lib/certificates";

export interface Certificate {
  id: string;
  user_id: string;
  title: string;
  issuer: string;
  issue_date: string | null;
  certificate_url: string | null;
  verification_status: "pending" | "verified" | "failed";
  verification_message: string | null;
  created_at: string;
  updated_at: string;
}

export const useCertificates = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificates = useCallback(async () => {
    if (!user) {
      setCertificates([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("certificates")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      const certs = (data as Certificate[]) || [];
      setCertificates(certs);
      // Persist to localStorage so both dashboards can access them
      certs.forEach((c) => saveLSCertificate(c));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch certificates");
      // Fall back to localStorage when Supabase is unavailable
      const lsCerts = getAllLSCertificates().filter((c) => c.user_id === user.id);
      setCertificates(lsCerts as Certificate[]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const addCertificate = async (
    title: string,
    issuer: string,
    issueDate?: string,
    certificateUrl?: string
  ): Promise<{ data: Certificate | null; error: string | null }> => {
    if (!user) {
      return { data: null, error: "User not authenticated" };
    }

    try {
      const { data, error: insertError } = await supabase
        .from("certificates")
        .insert({
          user_id: user.id,
          title,
          issuer,
          issue_date: issueDate || null,
          certificate_url: certificateUrl || null,
          verification_status: "pending",
        })
        .select()
        .single();

      if (insertError) throw insertError;
      
      // Save to localStorage
      saveLSCertificate(data as Certificate);
      
      // Refresh the list
      await fetchCertificates();
      
      return { data: data as Certificate, error: null };
    } catch (err) {
      return { 
        data: null, 
        error: err instanceof Error ? err.message : "Failed to add certificate" 
      };
    }
  };

  const updateCertificateStatus = async (
    certificateId: string,
    status: "pending" | "verified" | "failed",
    message?: string
  ): Promise<{ error: string | null }> => {
    try {
      const { error: updateError } = await supabase
        .from("certificates")
        .update({
          verification_status: status,
          verification_message: message || null,
        })
        .eq("id", certificateId);

      if (updateError) throw updateError;
      
      // Refresh the list (fetchCertificates will sync localStorage)
      await fetchCertificates();
      
      return { error: null };
    } catch (err) {
      return { 
        error: err instanceof Error ? err.message : "Failed to update certificate" 
      };
    }
  };

  const deleteCertificate = async (certificateId: string): Promise<{ error: string | null }> => {
    try {
      const { error: deleteError } = await supabase
        .from("certificates")
        .delete()
        .eq("id", certificateId);

      if (deleteError) throw deleteError;
      
      // Remove from localStorage
      deleteFromLS(certificateId);
      
      // Refresh the list
      await fetchCertificates();
      
      return { error: null };
    } catch (err) {
      return { 
        error: err instanceof Error ? err.message : "Failed to delete certificate" 
      };
    }
  };

  return {
    certificates,
    loading,
    error,
    refetch: fetchCertificates,
    addCertificate,
    updateCertificateStatus,
    deleteCertificate,
  };
};
