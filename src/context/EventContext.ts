/**
 * Event Context
 *
 * Provides event flow state across:
 * - Event Dashboard screens
 * - Fabric attach flow
 * - Guest payment flow
 *
 * Wraps useEventStore for React Context usage
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useEventStore } from '../store/event.store';
import { Fabric } from '../models/Fabric';
import { DistributionMode } from '../models/Event';

/**
 * Complete event context shape
 * Contains all data needed across event flows
 */
export interface EventContextShape {
  // Event identification
  eventId: string;
  
  // Distribution configuration
  distributionMode: DistributionMode;
  hostDeposit?: number; // Amount host is contributing
  hostDepositPercentage?: number; // Percentage of total
  
  // Guests in this event
  guests: Array<{
    id: string;
    email: string;
    status: 'invited' | 'accepted' | 'declined' | 'completed';
  }>;
  
  // Selected fabric for this event
  selectedFabric?: Fabric;
  
  // Pricing breakdown
  pricingBreakdown?: {
    fabricCost: number;
    tailor?: number;
    shipping?: number;
    platform_fee?: number;
    tax?: number;
    total: number;
    currency: string;
  };
}

interface EventContextType {
  // Active event context data
  activeEventContext: EventContextShape | null;
  
  // Loading & error states
  isLoading: boolean;
  error: string | null;
  
  // Actions to update context
  setDistributionMode: (mode: DistributionMode) => void;
  setHostDeposit: (amount: number, percentage?: number) => void;
  setSelectedFabric: (fabric: Fabric | undefined) => void;
  setPricingBreakdown: (breakdown: Partial<EventContextShape['pricingBreakdown']>) => void;
  calculateTotal: () => number;
  
  // Guest management
  updateGuestCount: () => number;
  
  // Context lifecycle
  initializeEventContext: (eventId: string, distributionMode: DistributionMode) => void;
  resetEventContext: () => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const eventStore = useEventStore();

  const value: EventContextType = {
    activeEventContext: eventStore.activeEventContext
      ? ({
          eventId: eventStore.activeEventContext.eventId,
          distributionMode: eventStore.activeEventContext.distributionMode,
          hostDeposit: eventStore.activeEventContext.hostDeposit,
          hostDepositPercentage: eventStore.activeEventContext.hostDepositPercentage,
          guests: eventStore.eventGuests.map((g) => ({
            id: g.id,
            email: g.email,
            status: g.status,
          })),
          selectedFabric: eventStore.activeEventContext.selectedFabric,
          pricingBreakdown: eventStore.activeEventContext.pricingBreakdown,
        } as EventContextShape)
      : null,
    
    isLoading: eventStore.isLoading,
    error: eventStore.error,
    
    setDistributionMode: (mode) => {
      eventStore.updateDistributionMode(mode);
    },
    
    setHostDeposit: (amount, percentage) => {
      eventStore.setHostDeposit(amount, percentage);
    },
    
    setSelectedFabric: (fabric) => {
      eventStore.setSelectedFabric(fabric);
    },
    
    setPricingBreakdown: (breakdown) => {
      eventStore.setPricingBreakdown(breakdown);
    },
    
    calculateTotal: () => {
      return eventStore.calculateTotal();
    },
    
    updateGuestCount: () => {
      return eventStore.eventGuests.length;
    },
    
    initializeEventContext: (eventId, distributionMode) => {
      eventStore.setActiveEventContext({
        eventId,
        distributionMode,
      });
    },
    
    resetEventContext: () => {
      eventStore.resetActiveContext();
    },
  };

  return React.createElement(EventContext.Provider, { value }, children);
};

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
};

/**
 * Legacy hook for backward compatibility
 * Prefer useEventContext for new code
 */
export const useEvent = useEventContext;
