# Workflow Components

**Phase 3: Enterprise Dashboard Architecture**

This directory contains workflow-related components for building intuitive, step-by-step user experiences in the DryJets merchant portal.

## Components

### 1. WorkflowStepper

Visual step indicator for multi-step workflows. Shows progress, current step, and allows navigation between steps.

**Features:**
- Visual step indicators (numbered, icons, checkmarks)
- Progress bar
- Current/completed/upcoming states
- Optional steps
- Clickable steps (with permissions)
- Compact and full variants
- Horizontal and vertical layouts
- Responsive design

**Usage:**

```typescript
import { WorkflowStepper, WorkflowStep } from '@/components/workflow/WorkflowStepper';
import { ShoppingCart, Truck, Package, Check } from 'lucide-react';

const steps: WorkflowStep[] = [
  {
    id: 'details',
    label: 'Order Details',
    description: 'Enter customer and service information',
    icon: ShoppingCart,
  },
  {
    id: 'items',
    label: 'Add Items',
    description: 'List items to be cleaned',
    icon: Package,
  },
  {
    id: 'pickup',
    label: 'Schedule Pickup',
    description: 'Choose pickup date and time',
    icon: Truck,
    optional: true,
  },
  {
    id: 'review',
    label: 'Review & Submit',
    description: 'Confirm order details',
    icon: Check,
  },
];

function CreateOrderWorkflow() {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="flex gap-8">
      {/* Sidebar - Stepper */}
      <div className="w-80">
        <WorkflowStepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={(index) => setCurrentStep(index)}
          allowClickAhead={false} // Only allow going back
        />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {currentStep === 0 && <OrderDetailsStep />}
        {currentStep === 1 && <AddItemsStep />}
        {currentStep === 2 && <SchedulePickupStep />}
        {currentStep === 3 && <ReviewStep />}

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          <Button
            variant="ghost"
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          <Button
            onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
            disabled={currentStep === steps.length - 1}
          >
            {currentStep === steps.length - 1 ? 'Submit' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

**Compact Variant** (for smaller spaces):

```typescript
<WorkflowStepper
  steps={steps}
  currentStep={currentStep}
  variant="compact"
/>
```

**Horizontal Layout** (for top navigation):

```typescript
import { HorizontalWorkflowStepper } from '@/components/workflow/WorkflowStepper';

<HorizontalWorkflowStepper
  steps={steps}
  currentStep={currentStep}
/>
```

### 2. NestedPanel

Slide-in panel for drill-down navigation without leaving the current page. Maintains a stack of views for seamless back/forward navigation.

**Features:**
- Slide-in animation from right
- Breadcrumb navigation
- View stack management
- Keyboard shortcuts (Esc, ⌘←)
- Multiple width options
- Mobile-responsive
- Context API for nested actions

**Usage:**

```typescript
import {
  NestedPanel,
  useNestedPanelState,
  useNestedPanel,
  PanelContent,
  PanelSection,
  PanelFooter,
} from '@/components/workflow/NestedPanel';
import { Button } from '@/components/ui/button-v2';

// Main component
function OrdersPage() {
  const { open, view, openPanel, closePanel } = useNestedPanelState();

  const handleViewOrder = (orderId: string) => {
    openPanel({
      id: `order-${orderId}`,
      title: `Order #${orderId}`,
      subtitle: 'View order details',
      width: 'lg',
      content: <OrderDetailsPanel orderId={orderId} />,
    });
  };

  return (
    <>
      {/* Main content */}
      <div>
        <button onClick={() => handleViewOrder('1234')}>View Order</button>
      </div>

      {/* Nested Panel */}
      {view && (
        <NestedPanel
          open={open}
          onOpenChange={closePanel}
          initialView={view}
        />
      )}
    </>
  );
}

// Panel content (can push more views)
function OrderDetailsPanel({ orderId }: { orderId: string }) {
  const { pushView } = useNestedPanel();

  const viewCustomer = (customerId: string) => {
    pushView({
      id: `customer-${customerId}`,
      title: 'Customer Details',
      subtitle: 'John Doe',
      width: 'md',
      content: <CustomerDetailsPanel customerId={customerId} />,
    });
  };

  return (
    <PanelContent>
      <PanelSection title="Order Information">
        <p>Order #: {orderId}</p>
        <p>Status: In Progress</p>
        <Button onClick={() => viewCustomer('cust-123')}>
          View Customer
        </Button>
      </PanelSection>

      <PanelFooter>
        <Button variant="ghost">Cancel</Button>
        <Button variant="primary">Update Order</Button>
      </PanelFooter>
    </PanelContent>
  );
}
```

**Width Options:**

```typescript
{
  width: 'sm',   // max-w-md (448px)
  width: 'md',   // max-w-lg (512px)
  width: 'lg',   // max-w-2xl (672px) - default
  width: 'xl',   // max-w-4xl (896px)
  width: 'full', // max-w-full
}
```

**Keyboard Shortcuts:**
- `Esc` - Close panel
- `⌘←` or `Ctrl+←` - Go back to previous view

## Complete Example: Order Creation Workflow

Here's a complete example combining both components:

```typescript
'use client';

import { useState } from 'react';
import { WorkflowStepper, WorkflowStep } from '@/components/workflow/WorkflowStepper';
import {
  NestedPanel,
  useNestedPanelState,
  useNestedPanel,
  PanelContent,
  PanelSection,
  PanelFooter,
} from '@/components/workflow/NestedPanel';
import { Button } from '@/components/ui/button-v2';
import { Input, Textarea, FormField } from '@/components/ui/input-v2';
import { ShoppingCart, Package, Truck, Check } from 'lucide-react';

const orderSteps: WorkflowStep[] = [
  {
    id: 'customer',
    label: 'Select Customer',
    description: 'Search and select customer',
    icon: ShoppingCart,
  },
  {
    id: 'service',
    label: 'Choose Service',
    description: 'Select cleaning service type',
    icon: Package,
  },
  {
    id: 'items',
    label: 'Add Items',
    description: 'List items to be cleaned',
    icon: Package,
  },
  {
    id: 'schedule',
    label: 'Schedule Pickup',
    description: 'Choose date and time',
    icon: Truck,
  },
  {
    id: 'review',
    label: 'Review',
    description: 'Confirm and submit',
    icon: Check,
  },
];

export default function CreateOrderPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const { open, view, openPanel, closePanel } = useNestedPanelState();

  const handleOpenCustomerSearch = () => {
    openPanel({
      id: 'customer-search',
      title: 'Select Customer',
      subtitle: 'Search existing or create new',
      width: 'lg',
      content: <CustomerSearchPanel />,
    });
  };

  const goNext = () => {
    if (currentStep < orderSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Workflow Progress */}
      <div className="w-80 border-r border-[#E5E7EB] dark:border-[#2A2A2D] p-6">
        <h2 className="text-xl font-bold text-[#111827] dark:text-[#FAFAFA] mb-6">
          Create Order
        </h2>
        <WorkflowStepper
          steps={orderSteps}
          currentStep={currentStep}
          onStepClick={(index) => {
            // Only allow going back
            if (index <= currentStep) {
              setCurrentStep(index);
            }
          }}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-[#111827] dark:text-[#FAFAFA]">
                  Select Customer
                </h3>
                <p className="text-sm text-[#6B7280] dark:text-[#A1A1A6] mt-1">
                  Search for an existing customer or create a new one
                </p>
              </div>

              <FormField label="Search Customer" required>
                <Input
                  placeholder="Search by name, email, or phone..."
                  iconBefore={<ShoppingCart className="h-4 w-4" />}
                />
              </FormField>

              <Button onClick={handleOpenCustomerSearch}>
                Browse Customers
              </Button>
            </div>
          )}

          {currentStep === 1 && <ServiceSelectionStep />}
          {currentStep === 2 && <AddItemsStep />}
          {currentStep === 3 && <SchedulePickupStep />}
          {currentStep === 4 && <ReviewStep />}
        </div>

        {/* Footer - Navigation */}
        <div className="border-t border-[#E5E7EB] dark:border-[#2A2A2D] px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={goBack}
              disabled={currentStep === 0}
            >
              Back
            </Button>

            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => {}}>
                Save Draft
              </Button>
              <Button
                variant="primary"
                onClick={goNext}
                disabled={currentStep === orderSteps.length - 1}
              >
                {currentStep === orderSteps.length - 1 ? 'Submit Order' : 'Continue'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Nested Panel for Customer Search */}
      {view && (
        <NestedPanel
          open={open}
          onOpenChange={closePanel}
          initialView={view}
        />
      )}
    </div>
  );
}

// Customer search panel content
function CustomerSearchPanel() {
  const { pushView } = useNestedPanel();

  const viewCustomerDetails = (customerId: string) => {
    pushView({
      id: `customer-${customerId}`,
      title: 'Customer Details',
      subtitle: 'View full customer profile',
      width: 'md',
      content: <CustomerDetailsPanel customerId={customerId} />,
    });
  };

  return (
    <PanelContent>
      <PanelSection>
        <FormField label="Search">
          <Input placeholder="Search customers..." />
        </FormField>

        <div className="space-y-2 mt-4">
          <button
            onClick={() => viewCustomerDetails('cust-1')}
            className="w-full text-left p-3 rounded-lg border border-[#E5E7EB] hover:bg-[#F9FAFB]"
          >
            <p className="font-medium">John Doe</p>
            <p className="text-sm text-[#6B7280]">john@example.com</p>
          </button>
          {/* More customers... */}
        </div>
      </PanelSection>

      <PanelFooter>
        <Button variant="ghost">Cancel</Button>
        <Button variant="primary">Select Customer</Button>
      </PanelFooter>
    </PanelContent>
  );
}

function CustomerDetailsPanel({ customerId }: { customerId: string }) {
  return (
    <PanelContent>
      <PanelSection title="Contact Information">
        <p>Email: john@example.com</p>
        <p>Phone: +1 (555) 123-4567</p>
      </PanelSection>

      <PanelSection title="Order History">
        <p>Total Orders: 24</p>
        <p>Lifetime Value: $1,240</p>
      </PanelSection>

      <PanelFooter>
        <Button variant="primary">Select This Customer</Button>
      </PanelFooter>
    </PanelContent>
  );
}
```

## Design Principles

1. **Progressive Disclosure**: Show only what's needed at each step
2. **Clear Navigation**: Always show where you are and where you can go
3. **Keyboard-First**: All interactions accessible via keyboard
4. **Fast & Smooth**: 150-200ms animations, no jank
5. **Mobile-Responsive**: Works on all screen sizes
6. **Accessible**: WCAG 2.1 Level AA compliant

## Best Practices

### WorkflowStepper

- Keep step labels short (1-3 words)
- Use descriptions to provide context
- Mark optional steps clearly
- Only allow forward navigation when step is complete
- Use icons to enhance recognition

### NestedPanel

- Keep nesting depth ≤ 3 levels
- Use breadcrumbs for deep nesting
- Provide clear titles and subtitles
- Include "Cancel" and "Confirm" actions
- Test with keyboard navigation

## Related Files

- [WorkflowStepper.tsx](./WorkflowStepper.tsx)
- [NestedPanel.tsx](./NestedPanel.tsx)
- [ENTERPRISE_DASHBOARD_ARCHITECTURE.md](../../../../../ENTERPRISE_DASHBOARD_ARCHITECTURE.md)
- [DESIGN_VISION.md](../../../../../DESIGN_VISION.md)
