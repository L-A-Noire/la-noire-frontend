import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronRight, MapPinIcon, ClockIcon } from "@hugeicons/core-free-icons";
import { format } from "date-fns";
import type { Testimony } from "@/types/evidence.type";

interface TestimonyCardProps {
    testimony: Testimony;
    canReview?: boolean;
}

export const TestimonyCard = ({ testimony, canReview }: TestimonyCardProps) => {
    return (
        <Card className="relative overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-base line-clamp-2">
                            {testimony.title}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                            #{testimony.id} • {format(new Date(testimony.created_at), "PPP")}
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Status */}
                <div>
                    <Badge
                        variant={testimony.is_confirmed ? "default" : "outline"}
                        className={
                            testimony.is_confirmed
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                        }
                    >
                        {testimony.is_confirmed ? "Confirmed" : "Pending Review"}
                    </Badge>
                </div>

                {/* Location & Time */}
                <div className="space-y-2 text-sm">
                    {testimony.location && (
                        <div className="flex items-start gap-2">
                            <HugeiconsIcon
                                icon={MapPinIcon}
                                className="h-4 w-4 text-muted-foreground mt-0.5"
                            />
                            <span className="text-sm line-clamp-2">{testimony.location}</span>
                        </div>
                    )}
                    <div className="flex items-start gap-2">
                        <HugeiconsIcon
                            icon={ClockIcon}
                            className="h-4 w-4 text-muted-foreground mt-0.5"
                        />
                        <span className="text-sm">
                            {format(new Date(testimony.seen_at), "PPP p")}
                        </span>
                    </div>
                </div>

                {/* Description Preview */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {testimony.description}
                </p>

                {/* Actions */}
                <Button variant="ghost" size="sm" className="mt-3 w-full justify-between" asChild>
                    <Link to={`/testimonies/${testimony.id}`}>
                        <span>{canReview && !testimony.is_confirmed ? "Review Testimony" : "View Details"}</span>
                        <HugeiconsIcon icon={ChevronRight} className="h-4 w-4" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
};