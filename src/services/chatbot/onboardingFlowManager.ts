import { supabase } from '../supabase';
import type {
  OnboardingSession,
  OnboardingStep,
  OnboardingStepResult,
  ProfileCompletionResult,
  OnboardingProgress,
} from '../../types/chatbot.types';
import type { UserRole, ForestPreference, UserProfile } from '../../types/user.types';

/**
 * OnboardingFlowManager
 * Manages post-registration conversational profile completion
 */
class OnboardingFlowManager {
  private sessions: Map<string, OnboardingSession> = new Map();

  /**
   * Start onboarding flow for a new user
   */
  startOnboarding(userId: string, email: string): OnboardingSession {
    const sessionId = `onboarding_${userId}_${Date.now()}`;
    
    const session: OnboardingSession = {
      sessionId,
      userId,
      email,
      currentStep: 'welcome',
      collectedData: {},
      startedAt: new Date(),
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * Get welcome message for onboarding
   */
  getWelcomeMessage(_email: string): string {
    return `Welcome to Gang Green! 🌳\n\nI'm here to help you complete your profile. This will only take a minute, and I'll guide you through each step.\n\nLet's get started! What's your full name?`;
  }

  /**
   * Process user response during onboarding
   */
  processOnboardingResponse(
    sessionId: string,
    response: string
  ): OnboardingStepResult {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return {
        message: 'Session not found. Please start over.',
        nextStep: 'welcome',
        isValid: false,
        validationError: 'Invalid session',
        progress: 0,
      };
    }

    const currentStep = session.currentStep;


    // Process based on current step
    switch (currentStep) {
      case 'welcome':
        return this.processWelcome(session);
      
      case 'full_name':
        return this.processFullName(session, response);
      
      case 'role':
        return this.processRole(session, response);
      
      case 'forest_preference':
        return this.processForestPreference(session, response);
      
      case 'phone':
        return this.processPhone(session, response);
      
      case 'location':
        return this.processLocation(session, response);
      
      case 'organization':
        return this.processOrganization(session, response);
      
      default:
        return {
          message: 'Something went wrong. Please try again.',
          nextStep: 'welcome',
          isValid: false,
          progress: 0,
        };
    }
  }

  /**
   * Skip current optional step
   */
  skipCurrentStep(sessionId: string): OnboardingStepResult {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return {
        message: 'Session not found.',
        nextStep: 'welcome',
        isValid: false,
        progress: 0,
      };
    }

    const currentStep = session.currentStep;
    
    // Only phone and location are skippable
    if (currentStep === 'phone' || currentStep === 'location') {
      const nextStep = this.getNextStep(session);
      session.currentStep = nextStep;
      this.sessions.set(sessionId, session);
      
      return {
        message: `No problem! ${this.getStepMessage(nextStep, session)}`,
        nextStep,
        isValid: true,
        progress: this.calculateProgress(session),
      };
    }

    return {
      message: 'This field is required. Please provide an answer.',
      nextStep: currentStep,
      isValid: false,
      progress: this.calculateProgress(session),
    };
  }

  /**
   * Complete onboarding and save profile
   */
  async completeOnboarding(sessionId: string): Promise<ProfileCompletionResult> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return {
        success: false,
        error: 'Session not found',
      };
    }

    try {
      const { collectedData, userId } = session;

      // Update user role and forest preference in users table
      if (collectedData.role || collectedData.forest_preference) {
        const { error: userError } = await supabase
          .from('users')
          .update({
            role: collectedData.role,
            forest_preference: collectedData.forest_preference,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (userError) throw userError;
      }

      // Create or update user profile
      const profileData: Partial<UserProfile> = {
        full_name: collectedData.full_name,
        phone: collectedData.phone,
        location: collectedData.location,
        organization: collectedData.organization,
      };

      const { data, error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Clean up session
      this.sessions.delete(sessionId);

      return {
        success: true,
        profile: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save profile',
      };
    }
  }

  /**
   * Get onboarding progress
   */
  getOnboardingProgress(sessionId: string): OnboardingProgress {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return {
        currentStep: 'welcome',
        totalSteps: 7,
        completedSteps: 0,
        percentComplete: 0,
      };
    }

    return {
      currentStep: session.currentStep,
      totalSteps: 7,
      completedSteps: this.getCompletedStepsCount(session),
      percentComplete: this.calculateProgress(session),
    };
  }

  // ============================================================================
  // Private Step Processing Methods
  // ============================================================================

  private processWelcome(session: OnboardingSession): OnboardingStepResult {
    session.currentStep = 'full_name';
    this.sessions.set(session.sessionId, session);
    
    return {
      message: this.getWelcomeMessage(session.email),
      nextStep: 'full_name',
      isValid: true,
      progress: 0,
    };
  }

  private processFullName(
    session: OnboardingSession,
    response: string
  ): OnboardingStepResult {
    const name = response.trim();
    
    if (!name || name.length < 2) {
      return {
        message: 'Please provide a valid name (at least 2 characters).',
        nextStep: 'full_name',
        isValid: false,
        validationError: 'Name too short',
        progress: this.calculateProgress(session),
      };
    }

    if (name.length > 100) {
      return {
        message: 'Name is too long. Please provide a shorter name (max 100 characters).',
        nextStep: 'full_name',
        isValid: false,
        validationError: 'Name too long',
        progress: this.calculateProgress(session),
      };
    }

    session.collectedData.full_name = name;
    const nextStep = this.getNextStep(session);
    session.currentStep = nextStep;
    this.sessions.set(session.sessionId, session);

    return {
      message: `Great, ${name}! ${this.getStepMessage(nextStep, session)}`,
      nextStep,
      isValid: true,
      progress: this.calculateProgress(session),
    };
  }

  private processRole(
    session: OnboardingSession,
    response: string
  ): OnboardingStepResult {
    const roleLower = response.toLowerCase().trim();
    let role: UserRole;

    if (roleLower.includes('individual') || roleLower.includes('person')) {
      role = 'individual';
    } else if (roleLower.includes('community') || roleLower.includes('group')) {
      role = 'community';
    } else if (
      roleLower.includes('organization') ||
      roleLower.includes('company') ||
      roleLower.includes('business')
    ) {
      role = 'organization';
    } else {
      return {
        message:
          'Please choose one of: Individual, Community, or Organization.',
        nextStep: 'role',
        isValid: false,
        validationError: 'Invalid role',
        progress: this.calculateProgress(session),
      };
    }

    session.collectedData.role = role;
    const nextStep = this.getNextStep(session);
    session.currentStep = nextStep;
    this.sessions.set(session.sessionId, session);

    return {
      message: `Perfect! ${this.getStepMessage(nextStep, session)}`,
      nextStep,
      isValid: true,
      progress: this.calculateProgress(session),
    };
  }

  private processForestPreference(
    session: OnboardingSession,
    response: string
  ): OnboardingStepResult {
    const forestLower = response.toLowerCase().trim();
    let forest: ForestPreference;

    if (forestLower.includes('kakamega')) {
      forest = 'kakamega';
    } else if (forestLower.includes('karura')) {
      forest = 'karura';
    } else if (forestLower.includes('mau')) {
      forest = 'mau';
    } else {
      return {
        message:
          'Please choose one of our pilot forests: Kakamega, Karura, or Mau.',
        nextStep: 'forest_preference',
        isValid: false,
        validationError: 'Invalid forest',
        progress: this.calculateProgress(session),
      };
    }

    session.collectedData.forest_preference = forest;
    const nextStep = this.getNextStep(session);
    session.currentStep = nextStep;
    this.sessions.set(session.sessionId, session);

    return {
      message: `Excellent choice! ${this.getStepMessage(nextStep, session)}`,
      nextStep,
      isValid: true,
      progress: this.calculateProgress(session),
    };
  }

  private processPhone(
    session: OnboardingSession,
    response: string
  ): OnboardingStepResult {
    const phone = response.trim();
    
    // Basic phone validation
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    
    if (!phoneRegex.test(phone)) {
      return {
        message:
          'Please provide a valid phone number, or type "skip" to skip this step.',
        nextStep: 'phone',
        isValid: false,
        validationError: 'Invalid phone format',
        progress: this.calculateProgress(session),
      };
    }

    session.collectedData.phone = phone;
    const nextStep = this.getNextStep(session);
    session.currentStep = nextStep;
    this.sessions.set(session.sessionId, session);

    return {
      message: `Got it! ${this.getStepMessage(nextStep, session)}`,
      nextStep,
      isValid: true,
      progress: this.calculateProgress(session),
    };
  }

  private processLocation(
    session: OnboardingSession,
    response: string
  ): OnboardingStepResult {
    const location = response.trim();
    
    if (location.length > 200) {
      return {
        message: 'Location is too long. Please provide a shorter location (max 200 characters).',
        nextStep: 'location',
        isValid: false,
        validationError: 'Location too long',
        progress: this.calculateProgress(session),
      };
    }

    session.collectedData.location = location;
    const nextStep = this.getNextStep(session);
    session.currentStep = nextStep;
    this.sessions.set(session.sessionId, session);

    return {
      message: `Thanks! ${this.getStepMessage(nextStep, session)}`,
      nextStep,
      isValid: true,
      progress: this.calculateProgress(session),
    };
  }

  private processOrganization(
    session: OnboardingSession,
    response: string
  ): OnboardingStepResult {
    const organization = response.trim();
    
    if (!organization || organization.length < 2) {
      return {
        message: 'Please provide your organization name.',
        nextStep: 'organization',
        isValid: false,
        validationError: 'Organization name too short',
        progress: this.calculateProgress(session),
      };
    }

    if (organization.length > 200) {
      return {
        message: 'Organization name is too long (max 200 characters).',
        nextStep: 'organization',
        isValid: false,
        validationError: 'Organization name too long',
        progress: this.calculateProgress(session),
      };
    }

    session.collectedData.organization = organization;
    const nextStep = this.getNextStep(session);
    session.currentStep = nextStep;
    this.sessions.set(session.sessionId, session);

    return {
      message: `Perfect! ${this.getStepMessage(nextStep, session)}`,
      nextStep,
      isValid: true,
      progress: this.calculateProgress(session),
    };
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private getNextStep(session: OnboardingSession): OnboardingStep {
    const { currentStep, collectedData } = session;
    
    const stepOrder: OnboardingStep[] = [
      'welcome',
      'full_name',
      'role',
      'forest_preference',
      'phone',
      'location',
      'organization',
      'complete',
    ];

    const currentIndex = stepOrder.indexOf(currentStep);
    let nextIndex = currentIndex + 1;

    // Skip organization step if not an organization
    if (
      stepOrder[nextIndex] === 'organization' &&
      collectedData.role !== 'organization'
    ) {
      nextIndex++;
    }

    return stepOrder[nextIndex] || 'complete';
  }

  private getStepMessage(step: OnboardingStep, _session: OnboardingSession): string {
    switch (step) {
      case 'full_name':
        return "What's your full name?";
      
      case 'role':
        return 'Are you joining as an Individual, Community member, or Organization?';
      
      case 'forest_preference':
        return 'Which forest would you like to focus on? We work with Kakamega, Karura, and Mau forests.';
      
      case 'phone':
        return "What's your phone number? (You can type 'skip' if you prefer not to share)";
      
      case 'location':
        return "Where are you located? (You can type 'skip' to skip this)";
      
      case 'organization':
        return "What's your organization name?";
      
      case 'complete':
        return "🎉 All done! Your profile is complete. Welcome to the Gang Green community! You can now explore initiatives, join projects, and start making an impact. What would you like to know about the platform?";
      
      default:
        return '';
    }
  }

  private calculateProgress(session: OnboardingSession): number {
    const totalSteps = 7; // welcome, name, role, forest, phone, location, org
    const completedSteps = this.getCompletedStepsCount(session);
    return Math.round((completedSteps / totalSteps) * 100);
  }

  private getCompletedStepsCount(session: OnboardingSession): number {
    const { collectedData, currentStep } = session;
    let count = 0;

    if (currentStep !== 'welcome') count++; // welcome completed
    if (collectedData.full_name) count++;
    if (collectedData.role) count++;
    if (collectedData.forest_preference) count++;
    if (collectedData.phone || currentStep !== 'phone') count++;
    if (collectedData.location || currentStep !== 'location') count++;
    if (
      collectedData.organization ||
      collectedData.role !== 'organization' ||
      currentStep !== 'organization'
    ) {
      count++;
    }

    return count;
  }
}

// Export singleton instance
export const onboardingFlowManager = new OnboardingFlowManager();
