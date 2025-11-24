/**
 * Submission Naming Convention Utilities
 * Implements the Wangari Maathai Hackathon 2025 naming requirements
 * Format: LochTech_Track3_WMH2025
 */

export const SUBMISSION_NAMING = {
  TEAM_NAME: 'GangGreen',
  TRACK: 'Track3',
  HACKATHON: 'WMH2025',
  BASE_FORMAT: 'GangGreen_Track3_WMH2025'
} as const;

/**
 * Generate compliant file names for submission deliverables
 */
export class SubmissionNamingService {
  /**
   * Get the base naming format
   */
  static getBaseFormat(): string {
    return SUBMISSION_NAMING.BASE_FORMAT;
  }

  /**
   * Generate pitch deck filename
   */
  static getPitchDeckFilename(): string {
    return `${SUBMISSION_NAMING.BASE_FORMAT}.pdf`;
  }

  /**
   * Generate demo video filename
   */
  static getDemoVideoFilename(): string {
    return `${SUBMISSION_NAMING.BASE_FORMAT}_Demo.mp4`;
  }

  /**
   * Generate repository name (if renaming is required)
   */
  static getRepositoryName(): string {
    return SUBMISSION_NAMING.BASE_FORMAT;
  }

  /**
   * Generate documentation package filename
   */
  static getDocumentationPackageName(): string {
    return `${SUBMISSION_NAMING.BASE_FORMAT}_Documentation.zip`;
  }

  /**
   * Validate if a filename follows the naming convention
   */
  static validateFilename(filename: string): boolean {
    const basePattern = SUBMISSION_NAMING.BASE_FORMAT;
    return filename.startsWith(basePattern);
  }

  /**
   * Get all required submission filenames
   */
  static getAllSubmissionFilenames(): {
    pitchDeck: string;
    demoVideo: string;
    repository: string;
    documentation: string;
  } {
    return {
      pitchDeck: this.getPitchDeckFilename(),
      demoVideo: this.getDemoVideoFilename(),
      repository: this.getRepositoryName(),
      documentation: this.getDocumentationPackageName()
    };
  }

  /**
   * Generate submission checklist with proper naming
   */
  static getSubmissionChecklist(): Array<{
    deliverable: string;
    filename: string;
    status: 'pending' | 'complete';
    required: boolean;
  }> {
    return [
      {
        deliverable: 'Pitch Deck (5-7 slides PDF)',
        filename: this.getPitchDeckFilename(),
        status: 'pending',
        required: true
      },
      {
        deliverable: 'Demo Video (2-3 minutes)',
        filename: this.getDemoVideoFilename(),
        status: 'pending',
        required: true
      },
      {
        deliverable: 'GitHub Repository',
        filename: this.getRepositoryName(),
        status: 'pending',
        required: true
      },
      {
        deliverable: 'Documentation Package',
        filename: this.getDocumentationPackageName(),
        status: 'pending',
        required: false
      }
    ];
  }
}

/**
 * Project metadata for submission
 */
export const PROJECT_METADATA = {
  name: '#GangGreen Platform',
  team: 'GangGreen',
  track: 'Track 3: Community Engagement and Sustainability',
  hackathon: 'Wangari Maathai Hackathon 2025',
  deadline: '2025-11-24T23:59:00+03:00', // EAT timezone
  submissionPlatform: 'DevFolio'
} as const;

/**
 * Submission requirements checklist
 */
export const SUBMISSION_REQUIREMENTS = {
  pitchDeck: {
    format: 'PDF',
    slides: '5-7 slides maximum',
    naming: SUBMISSION_NAMING.BASE_FORMAT + '.pdf',
    requiredContent: [
      'Team & Project Overview',
      'Problem Statement',
      'Proposed Solution',
      'Prototype/Technical Approach',
      'Impact & Feasibility'
    ]
  },
  demoVideo: {
    duration: '2-3 minutes',
    format: 'MP4 (recommended)',
    naming: SUBMISSION_NAMING.BASE_FORMAT + '_Demo.mp4',
    requiredContent: [
      'Solution overview',
      'Key features demonstration',
      'User interface walkthrough',
      'Track 3 alignment showcase'
    ]
  },
  repository: {
    platform: 'GitHub',
    naming: SUBMISSION_NAMING.BASE_FORMAT,
    requirements: [
      'Clear README with setup instructions',
      'Working prototype (deployable)',
      'Comprehensive documentation',
      'Technical progress demonstration'
    ]
  },
  documentation: {
    requirements: [
      'Datasets, APIs, and external services used',
      'Technical architecture and workflows',
      'User flows and interface descriptions',
      'Setup and installation guides'
    ]
  }
} as const;