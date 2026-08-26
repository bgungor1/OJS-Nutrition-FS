import { Check, MapPin, Truck, CreditCard } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Step {
    id: number
    title: string
    icon: LucideIcon
}

interface CheckoutStepperProps {
    currentStep: number
    steps?: Step[]
}

const defaultSteps: Step[] = [
    { id: 1, title: "Adres", icon: MapPin },
    { id: 2, title: "Kargo", icon: Truck },
    { id: 3, title: "Ödeme", icon: CreditCard }
]

export default function CheckoutStepper({
    currentStep,
    steps = defaultSteps
}: CheckoutStepperProps) {
    return (
        <div className="flex items-center justify-between mb-6 sm:mb-8 overflow-x-auto">
            {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${currentStep >= step.id
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-300 text-gray-400'
                        }`}>
                        {currentStep > step.id ? (
                            <Check className="w-5 h-5" />
                        ) : (
                            <step.icon className="w-5 h-5" />
                        )}
                    </div>
                    <span className={`ml-2 text-xs sm:text-sm font-medium ${currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
                        }`}>
                        {step.title}
                    </span>
                    {index < steps.length - 1 && (
                        <div className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                            }`} />
                    )}
                </div>
            ))}
        </div>
    )
}