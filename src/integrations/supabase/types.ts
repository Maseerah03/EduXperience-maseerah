export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      institution_profiles: {
        Row: {
          address: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          established_year: number | null
          id: string
          institution_name: string
          institution_type: string | null
          rating: number | null
          total_reviews: number | null
          updated_at: string
          user_id: string
          verified: boolean | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          established_year?: number | null
          id?: string
          institution_name: string
          institution_type?: string | null
          rating?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          established_year?: number | null
          id?: string
          institution_name?: string
          institution_type?: string | null
          rating?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
          website_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          area: string | null
          city: string | null
          created_at: string
          full_name: string
          id: string
          primary_language: string | null
          profile_photo_url: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          area?: string | null
          city?: string | null
          created_at?: string
          full_name: string
          id?: string
          primary_language?: string | null
          profile_photo_url?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          area?: string | null
          city?: string | null
          created_at?: string
          full_name?: string
          id?: string
          primary_language?: string | null
          profile_photo_url?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      student_learning_goals: {
        Row: {
          created_at: string
          id: string
          learning_objective: string | null
          proficiency_level: string | null
          student_id: string
          subject_id: string
          timeline: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          learning_objective?: string | null
          proficiency_level?: string | null
          student_id: string
          subject_id: string
          timeline?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          learning_objective?: string | null
          proficiency_level?: string | null
          student_id?: string
          subject_id?: string
          timeline?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_learning_goals_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "student_learning_goals_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      student_profiles: {
        Row: {
          age: number | null
          budget_max: number | null
          budget_min: number | null
          class_duration: number | null
          class_type_preference: string | null
          created_at: string
          date_of_birth: string | null
          education_level: string | null
          frequency: string | null
          id: string
          instruction_language: string | null
          learning_mode: string | null
          offline_radius: number | null
          onboarding_completed: boolean | null
          profile_completion_percentage: number | null
          schedule_preferences: Json | null
          special_requirements: string | null
          teaching_methodology: string | null
          tutor_gender_preference: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          budget_max?: number | null
          budget_min?: number | null
          class_duration?: number | null
          class_type_preference?: string | null
          created_at?: string
          date_of_birth?: string | null
          education_level?: string | null
          frequency?: string | null
          id?: string
          instruction_language?: string | null
          learning_mode?: string | null
          offline_radius?: number | null
          onboarding_completed?: boolean | null
          profile_completion_percentage?: number | null
          schedule_preferences?: Json | null
          special_requirements?: string | null
          teaching_methodology?: string | null
          tutor_gender_preference?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          budget_max?: number | null
          budget_min?: number | null
          class_duration?: number | null
          class_type_preference?: string | null
          created_at?: string
          date_of_birth?: string | null
          education_level?: string | null
          frequency?: string | null
          id?: string
          instruction_language?: string | null
          learning_mode?: string | null
          offline_radius?: number | null
          onboarding_completed?: boolean | null
          profile_completion_percentage?: number | null
          schedule_preferences?: Json | null
          special_requirements?: string | null
          teaching_methodology?: string | null
          tutor_gender_preference?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subject_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "subject_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      tutor_profiles: {
        Row: {
          availability: Json | null
          bio: string | null
          created_at: string
          experience_years: number | null
          hourly_rate_max: number | null
          hourly_rate_min: number | null
          id: string
          qualifications: Json | null
          rating: number | null
          teaching_mode: string | null
          total_reviews: number | null
          updated_at: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          availability?: Json | null
          bio?: string | null
          created_at?: string
          experience_years?: number | null
          hourly_rate_max?: number | null
          hourly_rate_min?: number | null
          id?: string
          qualifications?: Json | null
          rating?: number | null
          teaching_mode?: string | null
          total_reviews?: number | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          availability?: Json | null
          bio?: string | null
          created_at?: string
          experience_years?: number | null
          hourly_rate_max?: number | null
          hourly_rate_min?: number | null
          id?: string
          qualifications?: Json | null
          rating?: number | null
          teaching_mode?: string | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "student" | "tutor" | "institution" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["student", "tutor", "institution", "admin"],
    },
  },
} as const
