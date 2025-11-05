
interface TicketListHeaderProps {
  selectedDepartment: string;
  ticketCount: number;
  totalCount: number;
}

const TicketListHeader = ({ selectedDepartment }: TicketListHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold">
        {selectedDepartment === 'all' ? 'All Tickets' : `${selectedDepartment} Department Tickets`}
      </h2>
    </div>
  );
};

export default TicketListHeader;
